import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PolicyPage } from './entities/policy.entity';
import { CreatePolicyDto, UpdatePolicyDto } from './dto/policy.dto';

@Injectable()
export class PoliciesService {
  constructor(
    @InjectRepository(PolicyPage)
    private readonly policyRepo: Repository<PolicyPage>,
  ) { }

  async create(dto: CreatePolicyDto) {
    const exists = await this.policyRepo.findOne({ where: { slug: dto.slug } });
    if (exists) throw new ConflictException('Policy with this slug already exists');
    const policy = this.policyRepo.create(dto);
    return this.policyRepo.save(policy);
  }

  async findAll() {
    const policies = await this.policyRepo.find();
    return policies.map(p => ({ ...p, id: p.id?.toString?.() ?? String(p.id) }));
  }

  async findOne(slug: string) {
    const policy = await this.policyRepo.findOne({ where: { slug } });
    if (!policy) throw new NotFoundException('Policy not found');
    return { ...policy, id: policy.id?.toString?.() ?? String(policy.id) };
  }

  async update(slug: string, dto: UpdatePolicyDto) {
    const policy = await this.policyRepo.findOne({ where: { slug } });
    if (!policy) throw new NotFoundException('Policy not found');
    Object.assign(policy, dto);
    return this.policyRepo.save(policy);
  }

  async remove(slug: string) {
    const policy = await this.policyRepo.findOne({ where: { slug } });
    if (!policy) throw new NotFoundException('Policy not found');
    await this.policyRepo.delete(policy.id);
    return { success: true };
  }
}
