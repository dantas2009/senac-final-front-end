import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Usuario } from '../../../models/Usuario';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { regexValidator } from '../../../components/regexValidator';
import { compararValidator } from '../../../components/compararValidator';
import { FacebookLoginProvider, GoogleSigninButtonModule, SocialAuthService, SocialLoginModule, SocialUser } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, SocialLoginModule, GoogleSigninButtonModule],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css'
})
export class CadastroComponent {
  constructor(
    private _auth: AuthService,
    private _router: Router,
    private _fb: FormBuilder,
    private _authService: SocialAuthService
  ) { }

  cadastroForm!: FormGroup;
  user!: SocialUser;

  ngOnInit() {
    this.cadastroForm = this._fb.group({
      nome: ['', [regexValidator(/^[a-zA-Z\s]+$/)]],
      email: ['', [regexValidator(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/)]],
      senha: ['', [regexValidator(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/)]],
      repetirSenha: ['', [compararValidator('senha')]]
    });

    this._authService.authState.subscribe((user) => {
      console.log(user.provider);
      let login = {
        "provedor" : '',
        "token" : ''
      };

      if(user.provider == 'GOOGLE'){
        login = {
          "provedor" : 'google',
          "token" : user.idToken
        };
      }

      if(user.provider == 'FACEBOOK'){
        login = {
          "provedor" : 'facebook',
          "token" : user.authToken
        };
      }

      this._auth.socialLogin(login).subscribe({
        next: (rep) => {
          localStorage.setItem('token', rep.access_token);
          localStorage.setItem('loginReload', 'true');
          this._router.navigate(['/']);
        },
      });
    });
  }

  get nome() {
    return this.cadastroForm.get("nome")!;
  }

  get email() {
    return this.cadastroForm.get("email")!;
  }

  get senha() {
    return this.cadastroForm.get("senha")!;
  }

  get repetirSenha() {
    return this.cadastroForm.get("repetirSenha")!;
  }

  cadastrar() {
    if(this.cadastroForm.invalid){
      return;
    }

    const usuario: Usuario = {
      'nome': this.nome.value,
      'email': this.email.value,
      'senha': this.senha.value,
      'limite_gastos': 0
    }

    this._auth.cadastro(usuario).subscribe({
      next: (rep) => {
        localStorage.setItem('token', rep.access_token);
        localStorage.setItem('loginReload', 'true');
        this._router.navigate(['/']);
      },
      error: (err) => {
        Swal.fire('Ops, algo deu errado. Por favor, entre em contato com o administrador do sistema.');
      },
    });
  }

  loginFB(): void {
    this._authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }
}
