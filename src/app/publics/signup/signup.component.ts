import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../commons/services/notification.service';
import { AuthenticationService, SignupForm } from '../../commons/services/authentication.service';
import { CheckData, RegularExpression } from '../../commons/utils/constants';
import { DebounceHandler } from '../../commons/utils/debounce-handler';
import { HinttextOptions } from '../../commons/components/hinttext';
import { ValidatorsUtils } from '../../commons/utils/validators';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  standalone: false,
})
export class SignupComponent implements OnInit {
  private readonly HinttextEmail = {
    alreadyExists: {
      caption: 'El email ya se encuentra registrado',
      icon: 'warning',
      severity: 'warning',
    },
    notFound: {
      caption: 'El email se encuentra disponible',
      icon: 'check_circle',
      severity: 'success',
    },
    invalid: {
      caption: 'El email es inválido',
      icon: 'cancel',
      severity: 'danger',
    },
  };

  private readonly HinttextUsername = {
    alreadyExists: {
      caption: 'El nombre de usuario ya se encuentra registrado',
      icon: 'warning',
      severity: 'warning',
    },
    notFound: {
      caption: 'El nombre de usuario se encuentra disponible',
      icon: 'check_circle',
      severity: 'success',
    },
    invalid: {
      caption: 'El nombre de usuario es inválido',
      icon: 'cancel',
      severity: 'danger',
    },
  };

  form!: FormGroup;

  usernameControl: FormControl = new FormControl('', [Validators.required, Validators.min(3)]);
  emailControl: FormControl = new FormControl('', [Validators.required, Validators.email]);
  passwordControl: FormControl = new FormControl('', Validators.required);
  nameControl: FormControl = new FormControl('', Validators.required);
  lastnameControl: FormControl = new FormControl('', Validators.required);

  toggleEmailHinttext = false;
  toggleUsernameHinttext = false;

  emailHinttext: HinttextOptions = this.HinttextEmail.alreadyExists;
  usernameHinttext: HinttextOptions = this.HinttextUsername.alreadyExists;

  private emailDebouncer: DebounceHandler = new DebounceHandler({delay: 400});
  private usernameDebouncer: DebounceHandler = new DebounceHandler({delay: 400});

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private authenticationService: AuthenticationService,
  ) {
    this.form = new FormGroup({
      username: this.usernameControl,
      email: this.emailControl,
      password: this.passwordControl,
      name: this.nameControl,
      lastname: this.lastnameControl,
    });

    this
      .emailDebouncer
      .getContent()
      .subscribe(value => this.checkEmail(value));

    this
      .usernameDebouncer
      .getContent()
      .subscribe(value => this.checkUsername(value));
  }

  ngOnInit(): void {
    this
      .emailControl
      .valueChanges
      .subscribe(value => this.emailDebouncer.setContent(value));

    this
      .usernameControl
      .valueChanges
      .subscribe(value => this.usernameDebouncer.setContent(value));
  }

  // #region FETCH DATA

  checkEmail(value: string): void {
    (async () => {
      try {
        if (!value) {
          this.toggleEmailHinttext = false;
          return;
        }

        if (!value.match(RegularExpression.Email)) {
          this.emailHinttext = this.HinttextEmail.invalid;
          console.log({hinttext: this.emailHinttext});
          this.toggleEmailHinttext = true;
          return;
        }

        const response = await this.authenticationService.checkEmailOrUsernameExistence(value);

        if (response === CheckData.Exists) {
          this.emailHinttext = this.HinttextEmail.alreadyExists;
          this.toggleEmailHinttext = true;
          return;
        }

        this.emailHinttext = this.HinttextEmail.notFound;
        this.toggleEmailHinttext = true;
      }
      catch (error: any) {
        this.notificationService.showError(error.message);
      }
      finally{
        return Promise.resolve();
      }
    })();
  }

  checkUsername(value: string): void {
    (async () => {
      try {
        if (!value) {
          this.toggleUsernameHinttext = false;
          return;
        }

        if ((value.length < 3)) {
          this.usernameHinttext = this.HinttextUsername.invalid;
          console.log({hinttext: this.usernameHinttext});
          this.toggleUsernameHinttext = true;
          return;
        }

        const response = await this.authenticationService.checkEmailOrUsernameExistence(value, 'username');

        if (response === CheckData.Exists) {
          this.usernameHinttext = this.HinttextUsername.alreadyExists;
          this.toggleUsernameHinttext = true;
          return;
        }

        this.usernameHinttext = this.HinttextUsername.notFound;
        this.toggleUsernameHinttext = true;
      }
      catch (error: any) {
        this.notificationService.showError(error.message);
      }
      finally{
        return Promise.resolve();
      }
    })();
  }

  // #endregion FETCH DATA

  // #region EVENTS

  submitEventHandler(form: SignupForm): void {
    (async () => {
      const requireds = Object.values(form);

      if (!ValidatorsUtils.requiredObjectFields(requireds, requireds.length)) {
        this.notificationService.showError('Uno o más campos son inválidos.');
        return;
      }

      await this.sendData(form);
    })();
  }

  async sendData(values: SignupForm): Promise<void> {
    try {
      await this.authenticationService.signup(values);

      this.router.navigate([
        'webapp',
      ]);
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

