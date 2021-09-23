import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '@environments/environment.prod';

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
}
