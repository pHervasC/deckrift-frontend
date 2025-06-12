import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-shared-home-routed',
  templateUrl: './shared.home.routed.component.html',
  styleUrls: ['./shared.home.routed.component.css'],
   imports: [
      RouterModule
    ]
})
export class SharedHomeRoutedComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
