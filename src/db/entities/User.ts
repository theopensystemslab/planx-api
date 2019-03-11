import { hashSync } from 'bcryptjs'
import { Length } from 'class-validator'
import {
  AfterLoad,
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import Operation from './Operation'
import Team from './Team'

@Entity({ name: 'users' })
export default class User {
  @PrimaryGeneratedColumn('uuid')
  public id: string

  @Column({ unique: true, type: 'text', nullable: false })
  public username: string

  @Column({ type: 'text', nullable: false })
  @Length(6)
  public password: string

  private tempPassword: string

  @AfterLoad()
  private loadTempPassword(): void {
    this.tempPassword = this.password
  }

  @BeforeInsert()
  private encryptPassword(): void {
    this.password = hashSync(this.password, 10)
  }

  @OneToMany(type => Operation, operation => operation.actor)
  operations: Operation[]

  @ManyToOne(_type => Team, team => team.members)
  @JoinColumn({ name: 'team_id' })
  team: Team

  // @BeforeUpdate()
  // private updatePasswordIfNecessary(): void {
  //   if (this.tempPassword !== this.password) {
  //     this.password = hashSync(this.password, 10);
  //   }
  // }
}
