import { Length } from 'class-validator'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import Flow from './Flow'
import User from './User'

@Entity({ name: 'teams' })
export default class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @Length(3)
  name: string

  @Column({ unique: true })
  slug: string

  @OneToMany(_type => Flow, flow => flow.team)
  flows: Flow[]

  @OneToMany(type => User, user => user.team)
  members: User[]
}
