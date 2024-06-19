// src/app/components/achievement-showcase/achievement-showcase.component.ts

import { Component, OnInit } from '@angular/core';
import { AchievementService } from '../../services/achievement.service';

interface Achievement {
  date: string;
  label: string;
  icon: string;
  achievedIcon: string;
  count: number;
}

interface UserAchievement {
  username: string;
  attributes: Achievement[];
}

@Component({
  selector: 'app-achievement-showcase',
  templateUrl: './achievement-showcase.component.html',
  styleUrls: ['./achievement-showcase.component.css']
})
export class AchievementShowcaseComponent implements OnInit {
  videoAchievements: Achievement[] = [];
  userAchievements: UserAchievement[] = [];

  sections: { [key: string]: boolean } = {
    userAchievements: false
  };

  constructor(private achievementService: AchievementService) { }

  ngOnInit(): void {
    this.fetchVideoAchievements();
    this.fetchUserAchievements();
  }

  fetchVideoAchievements(): void {
    this.achievementService.getTotalLengthPerDay().subscribe(data => {
      this.videoAchievements = this.calculateVideoAchievements(data);
    });
  }

  fetchUserAchievements(): void {
    // Fetch user achievements here
  }

  calculateVideoAchievements(data: any): Achievement[] {
    const achievements: Achievement[] = [
      { label: '5h Badge', icon: 'assets/number-5.png', achievedIcon: 'assets/number-5-set.png', count: 0 , date:''},
      { label: '4h Badge', icon: 'assets/number-4.png', achievedIcon: 'assets/number-4-set.png', count: 0 , date:''},
      { label: '3h Badge', icon: 'assets/number-3.png', achievedIcon: 'assets/number-3-set.png', count: 0 , date:''},
      { label: 'New Year\'s Day', icon: 'assets/new-year.png', achievedIcon: 'assets/new-year-set.png', count: 0, date: '01-01' },
      { label: 'Christmas Day', icon: 'assets/christmas-wreath.png', achievedIcon: 'assets/christmas-wreath-set.png', count: 0, date: '12-25' }
    ];

    for (const date in data) {
      const lengthInSeconds = data[date];
      const dayMonth = date.slice(5); // Extract MM-DD from YYYY-MM-DD
      if (lengthInSeconds >= 18000) achievements[0].count++;
      if (lengthInSeconds >= 14400) achievements[1].count++;
      if (lengthInSeconds >= 10800) achievements[2].count++;

      achievements.forEach(achievement => {
        if (achievement.date === dayMonth) {
          achievement.count++;
        }
      });
    }

    // Return the achievements sorted by the order in the array
    return achievements;
  }

  toggleSection(section: string): void {
    this.sections[section] = !this.sections[section];
  }
}
