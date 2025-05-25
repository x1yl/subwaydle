import { Grid, Button } from "semantic-ui-react";
import TrainBullet from "./TrainBullet";

import "./Key.scss";

const Key = (props) => {
  const {
    id,
    isDarkMode,
    disabled,
    onClick,
    isCorrect,
    isSimilar,
    isPresent,
    isAbsent,
  } = props;

  const handleClick = () => {
    onClick(id);
  };

  let className = "";

  if (isCorrect) {
    className = "correct";
  } else if (isSimilar) {
    className = "similar";
  } else if (isPresent) {
    className = "present";
  } else if (isAbsent) {
    className = "absent";
  }

  return (
    <Grid.Column className="key" stretched>
      <Button
        disabled={disabled}
        onClick={handleClick}
        className={className}
        inverted={isDarkMode}
      >
        <TrainBullet id={id} size="small" />
      </Button>
    </Grid.Column>
  );
};

export default Key;
