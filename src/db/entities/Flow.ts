import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import Operation from './Operation'
import Team from './Team'
import User from './User'

@Entity({ name: 'flows' })
export default class Flow {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(_type => Team, team => team.flows)
  @JoinColumn({ name: 'team_id' })
  team: Team

  @Column({ nullable: true })
  name: string

  @Column({ type: 'integer', default: 1, nullable: true })
  version

  @Column({ type: 'jsonb', nullable: true })
  data: object

  @OneToMany(type => Operation, operation => operation.flow)
  operations: Operation[]

  @ManyToOne(_type => User, user => user.createdFlows)
  @JoinColumn({ name: 'creator_id' })
  creator: User
}
