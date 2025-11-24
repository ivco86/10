from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import os
from typing import List

from app.database import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

# OpenAI API integration
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


@router.post("/", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    AI Chat endpoint - разговор с AI асистент
    """

    # Check if OpenAI is configured
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key or not OPENAI_AVAILABLE:
        # Fallback response when OpenAI is not configured
        return ChatResponse(
            response=generate_fallback_response(request.message)
        )

    try:
        # Initialize OpenAI client
        client = openai.OpenAI(api_key=api_key)

        # Build messages for OpenAI
        messages = [
            {
                "role": "system",
                "content": """Ти си AI асистент за POS система за малък бизнес в България.
Помагаш на собственици на магазини с:
- Генериране на описания на продукти
- Съвети за ценообразуване
- Управление на инвентар
- Маркетингови стратегии
- Оптимизация на продажби

Отговаряй на български език, бъди приятелски настроен и конкретен в съветите си."""
            }
        ]

        # Add conversation history
        for msg in request.history[-10:]:  # Keep last 10 messages for context
            messages.append({
                "role": msg.role,
                "content": msg.content
            })

        # Add current message
        messages.append({
            "role": "user",
            "content": request.message
        })

        # Call OpenAI API
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=messages,
            max_tokens=1000,
            temperature=0.7
        )

        assistant_message = response.choices[0].message.content

        return ChatResponse(response=assistant_message)

    except Exception as e:
        print(f"OpenAI API error: {e}")
        # Return fallback response on error
        return ChatResponse(
            response=generate_fallback_response(request.message)
        )


def generate_fallback_response(message: str) -> str:
    """
    Generate a simple fallback response when OpenAI is not available
    """
    message_lower = message.lower()

    # Product descriptions
    if any(word in message_lower for word in ["описание", "продукт", "напиши"]):
        return """За да създам качествено описание на продукт, моля предоставете:
- Име на продукта
- Основни характеристики
- Предимства
- Целева аудитория

Пример за добро описание:
"[Име на продукт] - висококачествен продукт, специално разработен за [целева група].
Предлага [основни предимства] и се отличава с [уникални характеристики]."
"""

    # Pricing advice
    elif any(word in message_lower for word in ["цена", "цени", "ценообразуване"]):
        return """При определяне на цени, вземете предвид:

1. Себестойност + желана марж (обикновено 20-50%)
2. Цени на конкурентите
3. Стойност за клиента
4. Позициониране (премиум vs. бюджет)

Формула: Продажна цена = Себестойност × (1 + Марж%)

Пример: Себестойност 10лв, марж 30% → Цена = 10 × 1.30 = 13лв
"""

    # Inventory management
    elif any(word in message_lower for word in ["инвентар", "наличност", "склад"]):
        return """Съвети за управление на инвентар:

1. Използвайте ABC анализ:
   - A продукти (20% от артикулите, 80% от оборота) - проверявайте ежедневно
   - B продукти - проверявайте седмично
   - C продукти - проверявайте месечно

2. Поддържайте минимални количества
3. Следете срокове на годност
4. Правете редовни инвентаризации
5. Използвайте FIFO метода (първо влезли, първо излезли)
"""

    # Sales improvement
    elif any(word in message_lower for word in ["продажби", "продаж", "клиенти"]):
        return """Начини да увеличите продажбите:

1. Up-selling - предлагайте по-скъпи алтернативи
2. Cross-selling - предлагайте допълнителни продукти
3. Промоции и отстъпки за лоялни клиенти
4. Подобрете представянето на продуктите
5. Обучете персонала за по-добро обслужване
6. Създайте програма за лоялност
7. Използвайте социални медии за маркетинг
"""

    # Default response
    else:
        return """Здравейте! Аз съм AI асистент за вашата POS система.

Мога да ви помогна с:
- Генериране на описания на продукти
- Съвети за ценообразуване
- Управление на инвентар
- Стратегии за увеличаване на продажбите
- Други въпроси свързани с вашия бизнес

Моля, задайте конкретен въпрос или изберете някоя от темите по-горе.

Забележка: За пълна функционалност, конфигурирайте OPENAI_API_KEY в .env файла."""


@router.get("/test")
def test_chat():
    """Test endpoint to check if chat API is working"""
    return {
        "status": "ok",
        "openai_configured": bool(os.getenv("OPENAI_API_KEY")),
        "openai_available": OPENAI_AVAILABLE
    }
