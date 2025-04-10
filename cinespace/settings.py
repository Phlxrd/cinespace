import os
from pathlib import Path
from cryptography.fernet import Fernet
import dj_database_url
import pymysql

# Inicialização do MySQL (caso use localmente)
pymysql.install_as_MySQLdb()

# Diretório base
BASE_DIR = Path(__file__).resolve().parent.parent

# Ambiente atual (development ou production)
ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')

# Chave secreta
SECRET_KEY = os.getenv('SECRET_KEY', '-Nn<{P|;3dz&U_)Jh##9%l=SsO[[}Bjo.Ir}|?}#`xBMs``=C>')

# Debug
DEBUG = ENVIRONMENT == 'development'

# Hosts permitidos
ALLOWED_HOSTS = ['*'] if DEBUG else ['seudominio.com']  # ajuste para o domínio do Render se quiser

# Aplicativos instalados
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'contas',
    'pesquisa',
    'django_extensions',
    'reproducao',
    'spacemusic',
    'spacebot',
]

# Middlewares
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'contas.middleware.PerfilMiddleware',
]

ROOT_URLCONF = 'cinespace.urls'

# URL de login padrão
LOGIN_URL = 'paginalogin'

# Templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'cinespace.wsgi.application'

# Banco de Dados
if ENVIRONMENT == 'production':
    DATABASES = {
        'default': dj_database_url.config(conn_max_age=600, ssl_require=True)
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': 'cinespace',
            'USER': 'root',
            'PASSWORD': 'root',
            'HOST': 'localhost',
            'PORT': '3306',
            'OPTIONS': {
                'ssl': {'ca': None},
            },
        }
    }

# Local dos arquivos GEOIP (se for usar localização)
GEOIP_PATH = BASE_DIR / 'geoip'

# Validação de senha
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 8},
    },
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Usuário customizado e backend
AUTH_USER_MODEL = 'contas.Usuario'
AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'contas.backends.PersonalizadoBackend',
)

# Internacionalização
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Arquivos estáticos
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
    BASE_DIR / 'pesquisa',
    BASE_DIR / 'contas',
    BASE_DIR / 'spacemusic',
    BASE_DIR / 'reproducao',
]
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Arquivos de mídia
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# E-mail
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', 'oficialcinespace@gmail.com')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', 'eqxb suep grwj byzj')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'oficialcinespace@gmail.com')

# Sessões
SESSION_ENGINE = 'django.contrib.sessions.backends.db'
SESSION_COOKIE_AGE = 3600
SESSION_SAVE_EVERY_REQUEST = True
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG

# Chave de criptografia
ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY', Fernet.generate_key().decode())

# Log
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
import os

if os.environ.get('RUN_CREATE_SUPERUSER') == 'True':
    try:
        exec(open(os.path.join(BASE_DIR, 'create_superuser.py')).read())
    except Exception as e:
        print("Erro ao criar superusuário:", e)
