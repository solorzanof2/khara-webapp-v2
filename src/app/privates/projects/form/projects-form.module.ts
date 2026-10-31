import { NgModule } from '@angular/core';
import { ProjectsFormComponent } from './projects-form.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SimpleCardModule } from '../../../commons/components/simple-card';
import { ProjectService } from '../../../commons/services/project.service';


@NgModule({
  declarations: [
    ProjectsFormComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ProjectsFormComponent,
      },
    ]),
    FormsModule,
    ReactiveFormsModule,
    SimpleCardModule,
  ],
  providers: [
    ProjectService,
  ],
})
export class ProjectsFormModule { }

