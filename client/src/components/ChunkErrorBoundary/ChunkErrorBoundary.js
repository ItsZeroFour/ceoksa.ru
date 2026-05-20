import { Component } from "react";

/**
 * Ловит ошибки загрузки чанков, которые не удалось снять
 * авто-перезагрузкой в lazyWithRetry (повторный сбой подряд).
 * Вместо белого экрана показывает пользователю понятное сообщение.
 */
class ChunkErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
            textAlign: "center",
            padding: "24px",
          }}
        >
          <p>Не удалось загрузить страницу. Обновите её.</p>
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              padding: "10px 24px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Обновить
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;
