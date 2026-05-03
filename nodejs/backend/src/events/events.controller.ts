import { Controller, MessageEvent, Sse, UseGuards } from '@nestjs/common'
import { Observable, merge, timer } from 'rxjs'
import { map } from 'rxjs/operators'
import { AuthGuard }     from '../common/guards/auth.guard.js'
import { UserId }        from '../common/decorators/user.decorator.js'
import { EventsService } from './events.service.js'

@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Sse()
  @UseGuards(AuthGuard)
  stream(@UserId() userId: string): Observable<MessageEvent> {
    const channel$ = this.events.channel(userId).pipe(
      map(e => ({ type: e.event, data: e.data as object }) satisfies MessageEvent),
    )

    const ping$ = timer(0, 25_000).pipe(
      map(() => ({ type: 'ping', data: { ts: Date.now() } }) satisfies MessageEvent),
    )

    return merge(channel$, ping$)
  }
}
