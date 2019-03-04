import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Flow } from "./Flow";

@Entity()
export class Operation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(type => Flow, flow => flow.operations)
  flow: Flow;

  @Column({ type: "integer", default: 0, nullable: false })
  version;

  @Column({ type: "jsonb", nullable: false })
  data;
}
