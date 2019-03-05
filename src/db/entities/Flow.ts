import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import Operation from "./Operation";
import Team from "./Team";

@Entity()
export default class Flow {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(type => Team, team => team.flows)
  team: Team;

  @Column({ type: "jsonb" })
  data: object;

  @OneToMany(type => Operation, operation => operation.flow)
  operations: Operation[];
}
