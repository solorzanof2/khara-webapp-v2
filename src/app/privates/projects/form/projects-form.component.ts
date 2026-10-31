import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../commons/services/notification.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SelectValues } from '../../../commons/models/interfaces/globals';
import { ProjectForm, ProjectService } from '../../../commons/services/project.service';
import { Project } from '../../../commons/models/interfaces/responses/project.response';


@Component({
  selector: 'app-projects-form',
  templateUrl: './projects-form.component.html',
  styleUrls: ['./projects-form.component.scss'],
  standalone: false,
})
export class ProjectsFormComponent implements OnInit {
  private readonly FormTitle = {
    Create: 'Crear Nuevo Proyecto',
    Edition: 'Editar Proyecto',
  };

  private readonly ButtonText = {
    Create: 'AGREGAR',
    Edition: 'ACTUALIZAR',
  };

  form: FormGroup;

  nameControl: FormControl = new FormControl('', [Validators.required, Validators.minLength(3)]);
  keyControl: FormControl = new FormControl('', [Validators.required, Validators.minLength(3)]);
  visibilityControl: FormControl = new FormControl('', Validators.required);

  visibilities: SelectValues[] = [
    { label: 'Privado', value: 'private', },
    { label: 'Interno', value: 'internal', },
    { label: 'Team', value: 'team', },
    { label: 'Restringido', value: 'restricted', },
    { label: 'Público', value: 'public', },
  ];

  status: SelectValues[] = [
    { label: 'Activo', value: 'active', },
    { label: 'Inactivo', value: 'inactive', },
    { label: 'Archivar', value: 'archived', },
  ];

  private $projectStatusModel: string = 'active';

  set projectStatusModel(selected: string) {
    this.selectionChangeEventHandler(selected);
  }

  get projectStatusModel(): string {
    return this.$projectStatusModel;
  }

  reference: string = '';
  formTitle: string = this.FormTitle.Create;
  formSubmitButtonText: string = this.ButtonText.Create;

  private project: Project = {} as Project;

  get isEdition(): boolean {
    return !!this.reference;
  }

  get createdLabel(): string {
    return this.project.createdLabel;
  }

  get updatedLabel(): string {
    return this.project.updatedLabel;
  }

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private projectService: ProjectService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.form = new FormGroup({
      name: this.nameControl,
      key: this.keyControl,
      visibility: this.visibilityControl,
    });

    this.activatedRoute.queryParams.subscribe(params => {
      const reference = params['ref'];

      if (!reference) {
        return;
      }

      this.reference = reference;
      this.formTitle = this.FormTitle.Edition;
      this.formSubmitButtonText = this.ButtonText.Edition;
    });
  }

  ngOnInit(): void {
    (async () => {
      if (!this.isEdition) {
        return;
      }

      await this.fetchData();
    })();
  }

  // #region FETCH DATA

  async fetchData(): Promise<void> {
    try {
      const project = await this.projectService.fetchByUid(this.reference);

      this.nameControl.setValue(project.name);
      this.keyControl.setValue(project.key);
      this.visibilityControl.setValue(project.visibility);

      this.$projectStatusModel = project.status;

      this.project = project;
    }
    catch (error: any) {
      this.notificationService.showError(error.message);
    }
    finally {
      return Promise.resolve();
    }
  }

  // #endregion FETCH DATA

  // #region EVENTS

  formSubmitEventHandler(form: ProjectForm): void {
    (async () => {
      if (!form.name || form.name.length < 3) {
        this.notificationService.showError('El nombre del proyecto es requerido.');
        return;
      }

      if (!form.key || form.key.length < 3) {
        this.notificationService.showError('El nombre del clave del proyecto es requerido.');
        return;
      }

      if (!form.visibility) {
        this.notificationService.showError('El tipo de visibilidad del proyecto es requerido.');
        return;
      }

      if (this.isEdition) {
        await this.sendUpdateData(form);
        return;
      }

      await this.senData(form);

      this.router.navigate(['webapp']);
    })();
  }

  deleteClickEventHandler(): void {
    (async () => {
      await this.sendUpdateStatusData('deleted');
    })();
  }

  selectionChangeEventHandler(status: string): void {
    (async () => {
      await this.sendUpdateStatusData(status);
    })();
  }

  async senData(form: ProjectForm): Promise<void> {
    try {
      const userConfirmation = await this.notificationService.showQuestion('Confirma para enviar los datos del nuevo proyecto.');
      if (!userConfirmation) {
        return;
      }

      // console.log({form});
      await this.projectService.save(form);

      this.notificationService.show('Se ha creado el proyecto.');
    }
    catch (error: any) {
      this.notificationService.showError(error.message);
    }
    finally {
      return Promise.resolve();
    }
  }

  async sendUpdateData(form: ProjectForm): Promise<void> {
    try {
      const userConfirmation = await this.notificationService.showQuestion('Confirma para modificar la actualización del proyecto.');
      if (!userConfirmation) {
        return;
      }

      await this.projectService.update(form);

      this.notificationService.show('Se ha actualizado el proyecto.');
    }
    catch (error: any) {
      this.notificationService.showError(error.message);
    }
    finally {
      return Promise.resolve();
    }
  }

  async sendUpdateStatusData(status: string): Promise<void> {
    try {
      const userConfirmation = await this.notificationService.showQuestion('Confirma para ejecutar la administración del proyecto.');
      if (!userConfirmation) {
        return;
      }

      // console.log({status});
      await this.projectService.updateStatusByUid(this.reference, status);

      this.notificationService.show('El estado del proyecto se actualizó.');
    }
    catch (error: any) {
      this.notificationService.showError(error.message);
    }
    finally {
      return Promise.resolve();
    }
  }

  // #endregion EVENTS



}

