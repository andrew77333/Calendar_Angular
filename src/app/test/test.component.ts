import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatCalendar, MatCalendarCellCssClasses } from '@angular/material/datepicker';

interface testDate {
  date: string,
  value: boolean
};

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TestComponent implements OnInit {

  @ViewChild(MatCalendar) myCalendar!: MatCalendar<Date>;
  private defaultDates: Array<testDate> = [];
  private changedDates: Array<testDate> = [];
  private url = 'http://test.unit.homestretch.ch/';
  isLoadingPage = true;
  isRequestToServer = false;
  error = '';

  constructor(
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.http.get<Array<string>>(this.url).subscribe(
      res => {
        res.forEach(item => this.defaultDates.push({date: item, value: true}));
        this.changedDates = [...this.defaultDates];
        this.myCalendar.updateTodaysDate();
      },
      error => this.error = error.message,
      () => this.isLoadingPage = false
    );
  }

  dateClass() {
    return (date: Date): MatCalendarCellCssClasses => {
      const result = this.changedDates.find(item => item.value && item.date === this.formatDate(date));
      return result ? 'isChoicedDate' : '';
    };
  }

  onSelect(date: Date | null): void {
    if (!date) return;
    const dateFromChangedDates = this.findDate(date);
    const formattedDate = this.formatDate(date);
    if (dateFromChangedDates) {
      dateFromChangedDates.value = !dateFromChangedDates.value;
      this.myCalendar.updateTodaysDate();
    } else {
      this.changedDates.push({date: formattedDate, value: true});
      this.myCalendar.updateTodaysDate();
    }
  }

  findDate(date: Date): testDate | null {
    const formattedDate = this.formatDate(date);
    return this.changedDates.find(item => item.date === formattedDate) || null;
  }

  formatDate(date: Date): string {
    let dd = date.getDate().toString();
    if (+dd < 10) dd = '0' + dd;

    let mm = (date.getMonth() + 1).toString();
    if (+mm < 10) mm = '0' + mm;
  
    let yyyy = date.getFullYear().toString();
    if (+yyyy < 10) yyyy = '0' + yyyy;
  
    return yyyy + '-' + mm + '-' + dd;
  }

  resetCalendar(): void {
    this.changedDates = [...this.defaultDates];
    this.myCalendar.updateTodaysDate();
  }

  saveCalendar(): void {
    this.isRequestToServer = true;
    this.http.post<Array<string>>(this.url + 'save', this.changedDates)
      .subscribe(
        res => {
          this.defaultDates = []; // пока пусть так будет
          res.forEach(item => this.defaultDates.push({date: item, value: true}));
        },
        error => this.error = error.message,
        () => this.isRequestToServer = false
      );
  }
}
