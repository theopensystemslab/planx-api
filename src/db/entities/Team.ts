import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Flow from "./Flow";

@Entity({ name: "teams" })
export default class Team {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @OneToMany(_type => Flow, flow => flow.team)
  flows: Flow[];
}
