"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CheckCircle2, MapPin, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"
import { Separator } from "../../../../components/ui/separator"
import { formatPrice } from "../../../../lib/utils/format"
import { withProtectedRoute } from "../../../../lib/auth/protected-route"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ordersService } from "../../../../lib/api/services/orders"

// Map backend timeline to UI timeline
function mapOrderTimeline(tracking) {
  if (tracking && Array.isArray(tracking.timeline)) {
    return tracking.timeline.map((item) => ({
      status: item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : item.label,
      date: item.date ? new Date(item.date).toLocaleString() : '',
      completed: item.completed !== undefined ? item.completed : false,
    }));
  }
  return [];
}


function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.id;
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    // Use the new tracking endpoint for details page
    ordersService.track(orderId)
      .then((data) => {
        setTracking(data);
        setError(null);
      })
      .catch(() => setError("Failed to load order details."))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return <div className="py-12 text-center">Loading...</div>;
  }
  if (error) {
    return <div className="py-12 text-center text-red-500">{error}</div>;
  }
  if (!tracking) {
    return <div className="py-12 text-center">Order not found.</div>;
  }

  const timeline = mapOrderTimeline(tracking);
  const shippingAddress = tracking.shippingAddress || {};
  const paymentSummary = tracking.paymentSummary || {};
  // You may want to fetch order items separately if not included in tracking
  // For now, just show a placeholder
  const items = tracking.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/account/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{tracking.orderNumber || orderId}</h1>
          {/* You can add placed date if available */}
        </div>
        <Badge className="ml-auto bg-green-500/10 text-green-600 border-green-200" variant="outline">
          {tracking.status ? tracking.status.charAt(0).toUpperCase() + tracking.status.slice(1) : "-"}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-6">
                {timeline.length === 0 ? (
                  <div className="text-muted-foreground">No timeline available</div>
                ) : (
                  timeline.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="relative flex flex-col items-center">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            event.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {event.completed ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-current" />
                          )}
                        </div>
                        {index < timeline.length - 1 && (
                          <div className={`absolute top-8 h-full w-0.5 ${event.completed ? "bg-primary" : "bg-muted"}`} />
                        )}
                      </div>
                      <div className="pb-6">
                        <p className="font-medium">{event.status}</p>
                        <p className="text-sm text-muted-foreground">{event.date}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items Ordered</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.length === 0 ? (
                <div className="text-muted-foreground">No items found</div>
              ) : (
                items.map((item, index) => (
                  <div key={index} className="flex gap-4 rounded-lg border border-border p-4">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={item.image || item.product?.thumbnail || "/placeholder.svg"}
                        alt={item.product?.name || item.name || "Product"}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{item.product?.name || item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.variant || item.color || item.storage || ""}
                      </p>
                      <p className="mt-2 text-sm">Qty: {item.quantity}</p>
                      <p className="mt-1 font-semibold">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm">
                        Write Review
                      </Button>
                      <Button variant="outline" size="sm">
                        Buy Again
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{shippingAddress.fullName}</p>
                <p className="text-muted-foreground">{shippingAddress.address}</p>
                <p className="text-muted-foreground">
                  {shippingAddress.division}, {shippingAddress.district} - {shippingAddress.postCode}
                </p>
                <p className="flex items-center gap-1 text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {shippingAddress.phone}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(paymentSummary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-green-600">{paymentSummary.shipping === 0 || paymentSummary.shipping === 'FREE' ? "FREE" : formatPrice(paymentSummary.shipping)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (GST)</span>
                <span>{formatPrice(paymentSummary.tax || 0)}</span>
              </div>
              {paymentSummary.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-green-600">-{formatPrice(paymentSummary.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(paymentSummary.total)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Paid via {paymentSummary.paymentMethod}</p>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button variant="outline" className="w-full bg-transparent">
              Download Invoice
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              Need Help?
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withProtectedRoute(OrderDetailPage, {
  requiredRoles: ["user"],
})
