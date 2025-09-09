export * from './types';
export * from './descriptions';
export * from './posts';
export * from './market';

import { StudentData } from './types';
import { generateGroupDescription } from './descriptions';
import { generatePosts } from './posts';
import { generateMarketItems } from './market';

export class TemplateEngine {
  static generateGroupDescription(studentData: StudentData) {
    return generateGroupDescription(studentData);
  }

  static generatePosts(studentData: StudentData) {
    return generatePosts(studentData);
  }

  static generateMarketItems(studentData: StudentData) {
    return generateMarketItems(studentData);
  }

  static generateAllContent(studentData: StudentData) {
    return {
      groupDescription: this.generateGroupDescription(studentData),
      posts: this.generatePosts(studentData),
      marketItems: this.generateMarketItems(studentData),
    };
  }
}
