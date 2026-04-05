import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products') 
export class Product {
  
  @PrimaryGeneratedColumn() 
  id: number;

  @Column() 
  name: string;

  @Column()
  description: string;

  @Column('decimal') 
  price: number;

  @Column({ nullable: true })
  imageUrl: string; 
}