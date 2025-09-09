export * from './types';
export * from './image-generator';

import { ImageGenerator } from './image-generator';
import { StudentData, AvatarOptions, CoverOptions } from './types';

export class AssetGenerator {
  private imageGenerator: ImageGenerator;

  constructor() {
    this.imageGenerator = new ImageGenerator();
  }

  async generateAvatar(studentData: StudentData, options?: Partial<AvatarOptions>): Promise<Buffer> {
    return this.imageGenerator.generateAvatar(studentData, options);
  }

  async generateCover(studentData: StudentData, options?: Partial<CoverOptions>): Promise<Buffer> {
    return this.imageGenerator.generateCover(studentData, options);
  }

  async generateAllAssets(studentData: StudentData): Promise<{
    avatar: Buffer;
    cover: Buffer;
  }> {
    const [avatar, cover] = await Promise.all([
      this.generateAvatar(studentData),
      this.generateCover(studentData),
    ]);

    return { avatar, cover };
  }
}
