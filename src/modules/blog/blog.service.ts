import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Not } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  async findAll(page = 1, limit = 10, search?: string, category?: string) {
    const where: any = {};
    if (search) {
      where.title = Like(`%${search}%`);
    }
    if (category) {
      where.category = category;
    }
    const [data, total] = await this.blogRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { publishedAt: 'DESC' },
    });
    return { data, total, page, limit };
  }
  async findOneById(id: string) {
    // Try both 'id' and '_id' for compatibility
    let blog = await this.blogRepository.findOne({ where: { id: new ObjectId(id) } });
    if (!blog) {
      blog = await this.blogRepository.findOne({ where: { _id: new ObjectId(id) } } as any);
    }
    return blog;
  }

  async findOneBySlug(slug: string) {
    return this.blogRepository.findOne({ where: { slug } });
  }

  async create(blogData: Partial<Blog>) {
    const blog = this.blogRepository.create(blogData);
    return this.blogRepository.save(blog);
  }

  async update(id: string, blogData: Partial<Blog>) {
    // Try update by 'id' first, fallback to '_id'
    let result = await this.blogRepository.update({ id: new ObjectId(id) } as any, blogData);
    if (!result.affected) {
      result = await this.blogRepository.update({ _id: new ObjectId(id) } as any, blogData);
    }
    // Return the updated blog
    let blog = await this.blogRepository.findOne({ where: { id: new ObjectId(id) } });
    if (!blog) {
      blog = await this.blogRepository.findOne({ where: { _id: new ObjectId(id) } } as any);
    }
    return blog;
  }

  async remove(id: string) {
    // Try delete by 'id' first, fallback to '_id'
    let result = await this.blogRepository.delete({ id: new ObjectId(id) } as any);
    if (!result.affected) {
      result = await this.blogRepository.delete({ _id: new ObjectId(id) } as any);
    }
    return result;
  }
}
