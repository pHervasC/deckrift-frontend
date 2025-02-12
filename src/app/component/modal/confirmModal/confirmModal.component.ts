import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirmModal.component.html',
  styleUrls: ['./confirmModal.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class ConfirmModalComponent {
  @Input() title: string = 'Confirmación';
  @Input() message: string = '¿Estás seguro de continuar?';
  @Input() confirmText: string = 'Confirmar';
  @Input() cancelText: string = 'Cancelar';
  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  confirmar() {
    this.onConfirm.emit();
  }

  cancelar() {
    this.onCancel.emit();
  }
}
