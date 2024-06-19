import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VideoService } from '../../services/video.service';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';

interface Attribute {
  name: string;
  icon: string;
  selectedIcon: string;
  selected: boolean;
}

interface Sections {
  summary: boolean;
  transcript: boolean;
  attributes: boolean;
}

interface UserAttribute {
  username: string;
  attributes: Attribute[];
}

@Component({
  selector: 'app-video-detail',
  templateUrl: './video-detail.component.html',
  styleUrls: ['./video-detail.component.css']
})
export class VideoDetailComponent implements OnInit {
  video: any;
  safeUrl: SafeUrl = '';
  attributes: Attribute[] = [
    { name: 'beer', icon: 'assets/beer-icon.png', selectedIcon: 'assets/beer-icon-sel.png', selected: false },
    { name: 'whisky', icon: 'assets/whisky-icon.png', selectedIcon: 'assets/whisky-icon-sel.png', selected: false },
    { name: 'wine', icon: 'assets/wine-icon.png', selectedIcon: 'assets/wine-icon-sel.png', selected: false },
    { name: 'energy-drink', icon: 'assets/energy-drink-icon.png', selectedIcon: 'assets/energy-drink-icon-sel.png', selected: false },
    { name: 'pizza', icon: 'assets/pizza-icon.png', selectedIcon: 'assets/pizza-icon-sel.png', selected: false },
    { name: 'poutine', icon: 'assets/poutine-icon.png', selectedIcon: 'assets/poutine-icon-sel.png', selected: false },
    { name: 'children', icon: 'assets/children-icon.png', selectedIcon: 'assets/children-icon-sel.png', selected: false },
    { name: 'weekend', icon: 'assets/weekend-icon.png', selectedIcon: 'assets/weekend-icon-sel.png', selected: false }
  ];
  sections: Sections = { summary: false, transcript: false, attributes: false };
  configuredUsers: string[] = [];
  userAttributes: UserAttribute[] = [];

  constructor(
    private route: ActivatedRoute,
    private videoService: VideoService,
    private sanitizer: DomSanitizer,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.videoService.getVideoDetails(id).subscribe(data => {
        this.video = data;
        this.safeUrl = this.getSafeUrl(this.video.url);
        this.videoService.getUserAttributes().subscribe(configuredUsers => {
          this.configuredUsers = configuredUsers;
          this.initializeAttributes(data.attributes);
        });
      });
    } else {
      console.error('No video ID provided');
    }
  }

  getSafeUrl(url: string): SafeUrl {
    const embedUrl = this.transformUrl(url);
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  private transformUrl(url: string): string {
    if (url.includes('youtube.com/live/')) {
      return url.replace('youtube.com/live/', 'youtube.com/embed/');
    }
    return url;
  }

  toggleAttribute(attribute: Attribute, username: string): void {
    const userAttr = this.userAttributes.find(attr => attr.username === username);
    if (userAttr) {
      const attr = userAttr.attributes.find(attr => attr.name === attribute.name);
      if (attr) {
        attr.selected = !attr.selected;
      }
      this.saveAttributes(username);
    }
  }

  getAttributeIcon(attribute: Attribute, username: string): string {
    const userAttr = this.userAttributes.find(attr => attr.username === username);
    return userAttr && userAttr.attributes.find(attr => attr.name === attribute.name && attr.selected) ? attribute.selectedIcon : attribute.icon;
  }

  saveAttributes(username: string): void {
    const userAttr = this.userAttributes.find(attr => attr.username === username);
    if (userAttr) {
      const selectedAttributes = userAttr.attributes
        .filter(attr => attr.selected)
        .map(attr => attr.name);
      
      this.videoService.saveAttributes(this.video.id, selectedAttributes)
        .subscribe(response => {
          console.log('Attributes saved', response);
        }, error => {
          console.error('Error saving attributes', error);
        });
    }
  }

  toggleSection(section: keyof Sections): void {
    this.sections[section] = !this.sections[section];
  }

  initializeAttributes(savedAttributes: any[]): void {
    const attributesMap = new Map(savedAttributes.map(attr => [attr.username, attr.attributes]));
    this.userAttributes = this.configuredUsers.map(username => {
      const userAttrs = attributesMap.get(username) || [];
      const userAttributes = this.attributes.map(attr => ({
        ...attr,
        selected: userAttrs.includes(attr.name)
      }));
      return { username, attributes: userAttributes };
    });
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
}
