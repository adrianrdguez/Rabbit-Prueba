import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';

@Component({
  selector: 'auth-layout',
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayoutComponent implements OnInit {
  @Input() public picture: string =
    'https://images.unsplash.com/photo-1505904267569-f02eaeb45a4c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80';
  @Input() public title: string = '';
  @Input() public textBeforeLink: string = '';
  @Input() public textLink: string = '';
  @Input() public linkPath: string = '/';

  @Input() public logo: string = 'windelivery-logo';

  constructor() {}

  ngOnInit(): void {}
}
