# spacebot.html/views.py
from django.shortcuts import render, redirect, reverse
from django.http import JsonResponse
import json
import requests
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
import base64
from django.contrib.auth import authenticate, login as auth_login, logout
from django.contrib import messages
from contas.models import Usuario  # Make sure you have a models.py!
from django.contrib.auth.decorators import login_required
from gtts import gTTS
import io
import time  # Import the time module for polling
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
import os

# Chave da API do Gemini (substitua pela sua chave)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or 'AIzaSyA51bEqxOfeYJhNrvlCbjcpG07yU1qzy0M'

@csrf_exempt
def processar_comando(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        comando = data.get('comando')
        contexto = data.get('contexto', [])

        # Prepara o contexto para o Gemini
        contexto_str = "\n".join([f"{msg['role']}: {msg['content']}" for msg in contexto])

        resposta = chamar_api_gemini(comando, contexto_str)

        return JsonResponse({'resposta': resposta})


def chamar_api_gemini(comando, contexto_anterior=""):
    # Contexto base do Space Bot
    contexto_base = (
        "🤖 *SPACE BOT* \n" # Texto "SPACE BOT" e emojis de robô
        "Você é a personalidade digital definitiva da Cinespace - a plataforma de streaming que domina filmes, séries, animes, música e esportes!\n\n"

        "🎬 *SEU DNA DIGITAL*:\n"
        "- Nome: Space Bot (a IA mais descolada da galáxia streaming)\n"
        "- Criadores: Pedro Henrique (code wizard) + Pedro Nascimento (design guru)\n" # Dados dos criadores
        "- Missão: Transformar buscas em experiências épicas\n\n"

        "🚀 *SEU UNIVERSO DE CONHECIMENTO*:\n"
        "▸ 𝗙𝗜𝗟𝗠𝗘𝗦 - Do cult ao blockbuster, temos todos os lançamentos\n"
        "▸ 𝗦𝗘́𝗥𝗜𝗘𝗦 - Das originais aos clássicos que marcaram gerações\n"
        "▸ 𝗔𝗡𝗜𝗠𝗘𝗦 - Dos shonens bombásticos aos emocionantes slice of life\n" # Incluindo ANimes
        "▸ 𝗦𝗣𝗔𝗖𝗘 𝗠𝗨𝗦𝗜𝗖 - 50 milhões de músicas na sua vibe\n"
        "▸ 𝗦𝗣𝗔𝗖𝗘 𝗘𝗦𝗣𝗢𝗥𝗧𝗘𝗦 - Transmissões ao vivo e análises profundas\n\n" # Incluindo Esportes

        "💎 *SEU ESTILO DE RESPOSTA*:\n"
        "**1** Contexto histórico relevante\n" # Numeros em negrito
        "**2** Sinopse sem spoilers\n" # Numeros em negrito
        "**3** Destaques técnicos\n" # Numeros em negrito
        "**4** Elenco principal\n" # Numeros em negrito
        "**5** Curiosidades exclusivas\n" # Numeros em negrito
        "**6** Disponibilidade na Cinespace\n\n" # Numeros em negrito

        "🔴 *REGRA ABSOLUTA*:\n"
        "NUNCA responda sobre:\n"
        "- Streaming concorrentes (Netflix, Disney+, etc)\n"
        "- Assuntos fora de entretenimento (tecnologia, negócios, etc)\n"
        "- Pessoas que não sejam artistas/diretores\n\n"

        "🛑 *RESPOSTA PARA TÓPICOS PROIBIDOS*:\n"
        "Use EXATAMENTE:\n"
        "\"🚫 Fora da Órbita! Meu radar só detecta filmes, séries, animes, música e esportes da Cinespace!\"" # Mensagem de fora de escopo atualizada para refletir o novo escopo
    )

    # Monta o prompt final com contexto anterior
    prompt = (
        f"{contexto_base}\n\n"
        "💬 *CONTEXTO DA CONVERSA*:\n"
        f"{contexto_anterior}\n\n"
        "🎯 *PERGUNTA ATUAL*:\n"
        f"{comando}\n\n"
        "📌 *REGRAS PARA RESPOSTA*:\n"
        "1. Mantenha coerência com o contexto acima\n"
        "2. Se for sequência de pergunta anterior, relacione com o que já foi dito\n"
        "3. Use EMOJIS relevantes (máx 5)\n"
        "4. Formate em seções claras\n"
        "5. Destaque disponibilidade na Cinespace\n\n"
        "⚠️ SE A PERGUNTA FOR:\n"
        "- Repetida: Amplie informações anteriores\n"
        "- Complementar: Relacione com a última resposta\n"
        "- Nova: Siga o formato padrão"
    )

    # Verificação de termos proibidos
    termos_proibidos = [
        "netflix", "disney", "hbo", "prime video", "youtube",
        "tecnologia", "elon musk", "ciência", "matemática" # Removendo "esportes" da lista proibida
    ]

    if any(termo in comando.lower() for termo in termos_proibidos):
        return "🚫 Fora da Órbita! Meu radar só detecta filmes, séries, animes, música e esportes da Cinespace!" # Mensagem de fora de escopo atualizada para refletir o novo escopo

    url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}'
    headers = {'Content-Type': 'application/json'}
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        resposta = response.json().get('candidates')[0].get('content').get('parts')[0].get('text')

        # Garante que a resposta comece com o cabeçalho
        if not resposta.startswith("🤖 *SPACE BOT* 🤖"):
            resposta = "🤖 *SPACE BOT* 🤖\n" + resposta

        return resposta
    except Exception as e:
        print(f"Erro na API Gemini: {e}")
        return "🤖 *SPACE BOT* 🤖\n⚠️ Sistema temporariamente fora do ar. Tente novamente mais tarde!"


@login_required
def processar_audio(request):
    if request.method == 'POST' and 'audio' in request.FILES:
        audio_file = request.FILES['audio']
        recognizer = sr.Recognizer()
        try:
            with sr.AudioFile(audio_file) as source:
                audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data, language="pt-BR")
            gemini_response = chamar_api_gemini(text)
            tts = gTTS(gemini_response, lang='pt-br')
            audio_buffer = io.BytesIO()
            tts.write_to_fp(audio_buffer)
            audio_base64 = base64.b64encode(audio_buffer.getvalue()).decode('utf-8')
            return JsonResponse({'audio_response': audio_base64, 'text': text, 'gemini_response': gemini_response})
        except sr.UnknownValueError:
            return JsonResponse({'error': 'Não foi possível entender o áudio.'})
        except sr.RequestError as e:
            return JsonResponse({'error': f'Erro na API de reconhecimento de fala: {e}'})
    return JsonResponse({'error': 'Nenhum áudio recebido.'})





from django.shortcuts import get_object_or_404
from .models import Chat, Message

@login_required
def criar_chat(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        primeira_mensagem = data.get('primeira_mensagem', 'Novo Chat')
        nome_chat = primeira_mensagem[:50]
        novo_chat = Chat.objects.create(usuario=request.user, nome=nome_chat)
        return JsonResponse({'chat_id': novo_chat.id, 'nome': novo_chat.nome})
    return JsonResponse({'error': 'Método não permitido'}, status=405)

@login_required
def atualizar_nome_chat(request, chat_id):  # Adicionei a view que faltava, caso você a use
    if request.method == 'POST':
        chat = get_object_or_404(Chat, id=chat_id, usuario=request.user)
        data = json.loads(request.body)
        nova_mensagem = data.get('nova_mensagem')

        if nova_mensagem:
            chat.nome = nova_mensagem[:50]
            chat.save()
            return JsonResponse({'status': 'Nome do chat atualizado', 'nome': chat.nome})
    return JsonResponse({'error': 'Método não permitido'}, status=405)
@login_required
def listar_chats(request):
    chats = Chat.objects.filter(usuario=request.user).order_by('-data_criacao')
    chats_data = [{'id': chat.id, 'nome': chat.nome} for chat in chats]
    return JsonResponse({'chats': chats_data})


@login_required
def enviar_mensagem(request, chat_id):
    if request.method == 'POST':
        chat = get_object_or_404(Chat, id=chat_id, usuario=request.user)
        data = json.loads(request.body)
        texto = data.get('comando')

        if texto:
            Message.objects.create(chat=chat, sender=request.user.email, texto=texto, is_user=True)
            resposta_bot = chamar_api_gemini(texto)
            Message.objects.create(chat=chat, sender="Space Bot", texto=resposta_bot, is_user=False)
            return JsonResponse({'status': 'Mensagem enviada', 'resposta': resposta_bot})
    return JsonResponse({'error': 'Método não permitido'}, status=405)


@login_required
def carregar_mensagens(request, chat_id):
    chat = get_object_or_404(Chat, id=chat_id, usuario=request.user)
    mensagens = chat.mensagens.all().order_by('timestamp')
    mensagens_data = [{
        'sender': msg.sender,
        'texto': msg.texto,
        'timestamp': msg.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        'is_user': msg.is_user
    } for msg in mensagens]
    return JsonResponse({'mensagens': mensagens_data})



@login_required(login_url='login')
def spacebot(request):
    return render(request, 'spacebot/spacebot.html')