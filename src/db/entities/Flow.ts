import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import Operation from "./Operation";
import Team from "./Team";

@Entity({ name: "flows" })
export default class Flow {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(_type => Team, team => team.flows)
  @JoinColumn({ name: "team_id" })
  team: Team;

  @Column({ type: "jsonb" })
  data: object;

  @OneToMany(type => Operation, operation => operation.flow)
  operations: Operation[];
}
