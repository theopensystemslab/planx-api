import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Team } from "./Team";

@Entity()
export class Flow {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(type => Team, team => team.flows)
  team: Team;

  @Column({ type: "jsonb" })
  data: object;
}
