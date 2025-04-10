from django.contrib.auth import get_user_model

User = get_user_model()
username = "admin"
email = "admin@admin.com"
password = "admin123"
if os.environ.get('RUN_CREATE_SUPERUSER') == 'True':
    try:
        exec(open(os.path.join(BASE_DIR, 'create_superuser.py')).read())
    except Exception as e:
        print(f"Erro ao criar superusuário: {e}")
