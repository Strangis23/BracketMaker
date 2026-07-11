import type { Participant } from '../types';

interface ParticipantCardProps {
  participant: Participant;
  onClick?: () => void;
  selected?: boolean;
  eliminated?: boolean;
  compact?: boolean;
}

export function ParticipantCard({
  participant,
  onClick,
  selected,
  eliminated,
  compact,
}: ParticipantCardProps) {
  const classes = [
    'participant-card',
    onClick ? 'clickable' : '',
    selected ? 'selected' : '',
    eliminated ? 'eliminated' : '',
    participant.isBye ? 'bye' : '',
    compact ? 'compact' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={classes}
      onClick={onClick}
      {...(onClick ? {} : {})}
    >
      <div className="participant-avatar">
        {participant.imageUrl ? (
          <img src={participant.imageUrl} alt="" />
        ) : (
          <span className="avatar-placeholder">
            {participant.isBye ? '—' : participant.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <span className="participant-name">{participant.name}</span>
    </Tag>
  );
}
