import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})
export class Contact {
  isChatVisible: boolean = false;

  toggleChat() {
    this.isChatVisible = !this.isChatVisible;
  }

  closeChat() {
    this.isChatVisible = false;
  }
}
