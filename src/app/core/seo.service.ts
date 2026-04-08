import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoMetadata {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  author?: string;
  robots?: string;
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly platformId = inject(PLATFORM_ID);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Update page metadata for SEO
   */
  updateMetadata(metadata: SeoMetadata): void {
    // Title
    if (metadata.title) {
      this.titleService.setTitle(metadata.title);
      this.setMetaTag('og:title', metadata.ogTitle || metadata.title);
      this.setMetaTag('twitter:title', metadata.twitterTitle || metadata.title);
    }

    // Description
    if (metadata.description) {
      this.setMetaTag('description', metadata.description);
      this.setMetaTag('og:description', metadata.ogDescription || metadata.description);
      this.setMetaTag('twitter:description', metadata.twitterDescription || metadata.description);
    }

    // Keywords
    if (metadata.keywords) {
      this.setMetaTag('keywords', metadata.keywords);
    }

    // Canonical URL
    if (metadata.canonical) {
      this.setCanonicalUrl(metadata.canonical);
      this.setMetaTag('og:url', metadata.ogUrl || metadata.canonical);
    }

    // Open Graph Image
    if (metadata.ogImage) {
      this.setMetaTag('og:image', metadata.ogImage);
      this.setMetaTag('og:image:type', 'image/png');
    }

    // Twitter Card Image
    if (metadata.twitterImage) {
      this.setMetaTag('twitter:image', metadata.twitterImage);
    }

    // Author
    if (metadata.author) {
      this.setMetaTag('author', metadata.author);
    }

    // Robots
    if (metadata.robots) {
      this.setMetaTag('robots', metadata.robots);
    }
  }

  /**
   * Set a meta tag (creates or updates)
   * Only runs in browser context
   */
  private setMetaTag(name: string, content: string): void {
    if (!this.isBrowser) {
      return;
    }

    const isPropertyTag = name.startsWith('og:') || name.startsWith('twitter:');
    const selector = isPropertyTag ? `property="${name}"` : `name="${name}"`;

    let element = document.querySelector(`meta[${selector}]`) as HTMLMetaElement;
    if (!element) {
      element = document.createElement('meta');
      if (isPropertyTag) {
        element.setAttribute('property', name);
      } else {
        element.setAttribute('name', name);
      }
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  }

  /**
   * Set canonical URL
   * Only runs in browser context
   */
  private setCanonicalUrl(url: string): void {
    if (!this.isBrowser) {
      return;
    }

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  /**
   * Add structured data (JSON-LD) to page
   * Only runs in browser context
   */
  addStructuredData(data: StructuredData): void {
    if (!this.isBrowser) {
      return;
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  /**
   * Generate person schema for portfolio
   */
  generatePersonSchema(name: string, description: string, url: string, imageUrl?: string): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name,
      description,
      url,
      image: imageUrl || `${url}/assets/profile_image.png`,
      sameAs: [
        'https://github.com/nelsonsozinho',
        'https://linkedin.com/in/nelsonsozinho',
      ],
      jobTitle: 'Software Engineer, Full Stack Developer',
      workLocation: {
        '@type': 'Place',
        name: 'Remote',
      },
    };
  }

  /**
   * Generate BreadcrumbList schema for navigation
   */
  generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };
  }

  /**
   * Generate FAQ schema
   */
  generateFaqSchema(faqs: Array<{ question: string; answer: string }>): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };
  }
}

