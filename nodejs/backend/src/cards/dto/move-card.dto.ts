import { IsIn } from 'class-validator'
import type { BoardColumn } from '../../gmail/interfaces/gmail.interfaces.js'

export class MoveCardDto {
  @IsIn(['decide', 'review', 'ready', 'hidden'])
  column: BoardColumn
}
