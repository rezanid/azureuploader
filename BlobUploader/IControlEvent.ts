// IControlEvent.ts

export interface IControlEvent {
    lastEvent:
      'None' |
      'Completed' |
      'Error' |
      'FileSelected'
    errorMessage?: string;
  }