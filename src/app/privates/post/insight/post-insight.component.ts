import { Component } from '@angular/core';
import { PostSingleComponent } from '../single/post-single.component';

@Component({
  selector: 'app-post-insight',
  templateUrl: '../single/post-single.component.html',
  styleUrls: ['../single/post-single.component.scss'],
  standalone: false,
})
export class PostInsightComponent extends PostSingleComponent {}
