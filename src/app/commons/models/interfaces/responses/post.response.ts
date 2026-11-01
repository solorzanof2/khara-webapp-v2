import { Project } from './project.response';


export interface BasePostDTO {

  type?: 'comment' | 'insight';

  uid: string;
  rawContent: string;
  htmlContent: string;
  createdLabel: string;
  created: number;
  updatedLabel: string;
  updated: number;
  totalComments: number;
  totalInsights: number;
  displayName: string;
  mention: string;

}


export interface InsightPostDTO extends BasePostDTO {

  comments: BasePostDTO[];
  bricks: BasePostDTO[];

}


export interface FullPostDTO extends BasePostDTO {

  project: Project;
  insights: InsightPostDTO[];
  comments: BasePostDTO[];

}

