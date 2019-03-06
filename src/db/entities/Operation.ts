import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import Flow from "./Flow";
import User from "./User";

@Entity({ name: "operations" })
export default class Operation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(_type => Flow, flow => flow.operations)
  @JoinColumn({ name: "flow_id" })
  flow: Flow;

  @Column({ type: "integer", default: 0, nullable: false })
  version;

  @Column({ type: "jsonb", nullable: false })
  data;

  @ManyToOne(_type => User, user => user.operations)
  @JoinColumn({ name: "actor_id" })
  actor: User;
}
