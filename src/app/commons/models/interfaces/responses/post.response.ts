import { BrickAttributes } from '../brick';
import { Project } from './project.response';


export interface BasePostDTO {

  attributes?: BrickAttributes;
  category?: string;

  type?: 'post';

  uid: string;
  rawContent: string;
  htmlContent: string;
  createdLabel: string;
  created: number;
  updatedLabel: string;
  updated: number;
  totalChilds: number;
  displayName: string;
  mention: string;

}


export interface InsightPostDTO extends BasePostDTO {

  comments: BasePostDTO[];
  bricks: BasePostDTO[];

}


export interface FullPostDTO extends BasePostDTO {

  project: Project;
  childs: BasePostDTO[];

}


export interface FullInsightDTO extends InsightPostDTO {
  parentUid: string;
  totalBricks: number;
  project: Project;
}
