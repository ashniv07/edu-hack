import { motion } from 'framer-motion';
import { COLORS, ANIMATION } from '../../constants';

interface PlaybackControlsProps {
  isPlaying: boolean;
  isAtStart: boolean;
  isAtEnd: boolean;
  speed: number;
  onPlayPause: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

export function PlaybackControls({
  isPlaying,
  isAtStart,
  isAtEnd,
  speed,
  onPlayPause,
  onPrevStep,
  onNextStep,
  onReset,
  onSpeedChange,
}: PlaybackControlsProps) {
  const styles: Record<string, React.CSSProperties> = {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '32px',
      height: '32px',
      border: 'none',
      borderRadius: '6px',
      background: COLORS.ui.background,
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.15s ease',
    },
    buttonDisabled: {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
    playButton: {
      width: '40px',
      height: '40px',
      background: COLORS.status.info,
      color: '#ffffff',
      fontSize: '16px',
    },
    speedButton: {
      padding: '4px 8px',
      width: 'auto',
      fontSize: '11px',
      fontWeight: 600,
      fontFamily: 'monospace',
    },
    speedActive: {
      background: COLORS.status.info,
      color: '#ffffff',
    },
    divider: {
      width: '1px',
      height: '24px',
      background: COLORS.ui.border,
      margin: '0 4px',
    },
  };

  const Button = ({
    onClick,
    disabled,
    style,
    children,
    title,
  }: {
    onClick: () => void;
    disabled?: boolean;
    style?: React.CSSProperties;
    children: React.ReactNode;
    title?: string;
  }) => (
    <motion.button
      onClick={disabled ? undefined : onClick}
      style={{
        ...styles.button,
        ...style,
        ...(disabled ? styles.buttonDisabled : {}),
      }}
      whileHover={disabled ? {} : { scale: 1.05, background: COLORS.ui.borderHover }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      title={title}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );

  return (
    <div style={styles.container}>
      {/* Reset button */}
      <Button onClick={onReset} disabled={isAtStart} title="Reset">
        ↺
      </Button>

      {/* Previous step */}
      <Button onClick={onPrevStep} disabled={isAtStart} title="Previous step">
        ◀
      </Button>

      {/* Play/Pause button */}
      <motion.button
        onClick={onPlayPause}
        style={{ ...styles.button, ...styles.playButton }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '⏸' : '▶'}
      </motion.button>

      {/* Next step */}
      <Button onClick={onNextStep} disabled={isAtEnd} title="Next step">
        ▶
      </Button>

      <div style={styles.divider} />

      {/* Speed controls */}
      {ANIMATION.speeds.map((s) => (
        <Button
          key={s}
          onClick={() => onSpeedChange(s)}
          style={{
            ...styles.speedButton,
            ...(speed === s ? styles.speedActive : {}),
          }}
          title={`${s}x speed`}
        >
          {s}x
        </Button>
      ))}
    </div>
  );
}
