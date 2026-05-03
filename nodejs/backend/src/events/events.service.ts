import { Injectable } from '@nestjs/common'
import { Subject } from 'rxjs'

export interface SseEvent {
  event: string
  data:  unknown
}

@Injectable()
export class EventsService {
  private readonly channels = new Map<string, Subject<SseEvent>>()

  /** Returns (or creates) the Subject for a userId. */
  channel(userId: string): Subject<SseEvent> {
    let sub = this.channels.get(userId)
    if (!sub) {
      sub = new Subject<SseEvent>()
      this.channels.set(userId, sub)
    }
    return sub
  }

  publish(userId: string, event: string, data: unknown): void {
    this.channels.get(userId)?.next({ event, data })
  }

  remove(userId: string): void {
    this.channels.get(userId)?.complete()
    this.channels.delete(userId)
  }
}
