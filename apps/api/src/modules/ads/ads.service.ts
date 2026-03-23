import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AdStatus } from '@prisma/client';

@Injectable()
export class AdsService {
  constructor(private prisma: PrismaService) {}

  async getActiveAdForSlot(slotCode: string) {
    const now = new Date();
    const slot = await this.prisma.adSlot.findUnique({
      where: { code: slotCode },
      include: {
        ads: {
          where: {
            status: AdStatus.ACTIVE,
            startDate: { lte: now },
            endDate: { gte: now },
          },
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });
    if (!slot || !slot.enabled) return null;
    return slot.ads[0] ?? null;
  }

  async getSlots() {
    return this.prisma.adSlot.findMany({
      include: {
        ads: {
          where: { status: AdStatus.ACTIVE },
          select: { id: true, title: true, status: true, startDate: true, endDate: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async recordImpression(adId: string) {
    await this.prisma.ad.update({
      where: { id: adId },
      data: { impressions: { increment: 1 } },
    }).catch(() => {});
  }

  async recordClick(adId: string) {
    await this.prisma.ad.update({
      where: { id: adId },
      data: { clicks: { increment: 1 } },
    }).catch(() => {});
  }

  async createSlot(code: string, name: string) {
    return this.prisma.adSlot.create({ data: { code, name } });
  }

  async createAd(data: any) {
    return this.prisma.ad.create({ data });
  }

  async updateAd(id: string, data: any) {
    return this.prisma.ad.update({ where: { id }, data });
  }
}
