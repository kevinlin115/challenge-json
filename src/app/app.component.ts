import { Component, OnInit } from '@angular/core';
import { environment } from '@environments/environment.prod';
import { Subject } from 'rxjs';
import { AchievementItemsColumm } from './constant/achievement-items-column';
import { AchievementsColumn } from './constant/achievements-column';
import { Challenge } from './constant/challenge';
import { ChallengeJson } from './constant/challenge-json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
  ) { }

  ngOnInit(): void {
  }

  challenges = [] as Challenge[];
  /** 所有挑戰的子挑數目 */
  subCountList = [] as number[];

  leagueName = environment.league;

  achievementsFile: File = new File([], '');
  achievements = [] as string[][];

  achievementItemFile: File = new File([], '');
  achievementItems = [] as string[][];

  onAchievementsChange(event: any) {
    this.achievementsFile = event.target.files[0];
    this.readFile(this.achievementsFile).subscribe(result => {
      this.achievements = result;
      console.log(`achievements = `, this.achievements);
    })
  }

  onAchievementsItemsChange(event: any) {
    this.achievementItemFile = event.target.files[0];
    this.readFile(this.achievementItemFile).subscribe(result => {
      this.achievementItems = result;
      console.log(`achievementItems = `, this.achievementItems);
    })
  }

  trasform() {
    try {
      this.achievements.forEach(achievement => {
        this.challenges.push(new Challenge({
          id: achievement[AchievementsColumn.Id],
          name: achievement[AchievementsColumn.Description]
        }));
      });
      this.challenges.forEach(challenge => {
        const tempAchievementItems = this.achievementItems.filter(achievementItem => {
          // 需要先判斷 challenge id 結尾是不是大寫，如果是大寫需要加上 _
          const lastLetter = challenge.id.substr(challenge.id.length - 1)
          const filterStr = lastLetter.toUpperCase() === lastLetter ? `${challenge.id}_` : `${challenge.id}`;
          return achievementItem[AchievementItemsColumm.Id].startsWith(filterStr)
        })
        if (tempAchievementItems.length > 1) {
          challenge.subChallengeNames = tempAchievementItems.map(achievementItem => achievementItem[AchievementItemsColumm.Name]);
        }
      });
      console.log(`challenges = `, this.challenges);
      this.subCountList = this.challenges.map(challenge => challenge.subChallengeNames.length);
      this.downloadJson(this.challenges);
    } catch (err) {
      console.error(err);
    }
  }

  private readFile(file: File): Subject<string[][]> {
    const subject = new Subject<string[][]>();
    var reader = new FileReader();
    reader.onload = () => {
      const file: string = reader.result as string;
      const eachLine = file.split('\n');
      const result = [] as string[][];
      /** Filterd by league name */
      eachLine.filter(line => {
        return line.startsWith(this.leagueName)
      }).forEach((line, index) => {
        result[index] = line.split(',')
      });
      subject.next(result);
      subject.complete();
    };
    reader.readAsText(file);
    return subject;
  }

  private downloadJson(challenges: Challenge[]) {
    const challengeJson = new ChallengeJson();
    challenges.forEach((challenge, index) => {
      challengeJson.CHALLENGE[index] = {
        NAME: challenge.name
      }
      challenge.subChallengeNames.forEach((subChallenge, subIndex) => {
        challengeJson.CHALLENGE[index][subIndex] = {
          NAME: subChallenge
        }
      });
    });

    const json = JSON.stringify(challengeJson, null, 4);
    const blob1 = new Blob([json], { type: "application/json" });
    const url = window.URL || window.webkitURL;
    const link = url.createObjectURL(blob1);
    console.log(`link = `, link);
    const a = document.createElement("a");
    a.download = "challenge.json";
    a.href = link;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
