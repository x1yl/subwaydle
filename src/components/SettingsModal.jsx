import { useState } from "react";
import { Modal, Header, Grid, Checkbox, Icon, Popup } from "semantic-ui-react";
import { saveSettings, loadSettings, defaultSettings } from "../utils/settings";

import "./SettingsModal.scss";

const SettingsModal = (props, state) => {
  const { open, handleClose, onSettingsChange, isDarkMode } = props;
  const [settings, setSettings] = useState(loadSettings());

  const showAnswerStatusBadgesToggleChanged = (event, value) => {
    const settings = { ...defaultSettings };

    settings.display.showAnswerStatusBadges = value.checked;

    saveSettings(settings);
    setSettings(settings);
    onSettingsChange(settings);
  };

  const darkModeToggleChanged = (event, value) => {
    const newSettings = {
      ...settings,
      display: {
        ...settings.display,
        darkMode: value.checked,
      },
    };
    saveSettings(newSettings);
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const weekendToggleChanged = (event, value) => {
    const newSettings = {
      ...settings,
      gameplay: {
        ...settings.gameplay,
        includeWeekend: value.checked,
      },
    };
    saveSettings(newSettings);
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <Modal
      closeIcon
      open={open}
      onClose={handleClose}
      size="tiny"
      className={isDarkMode ? "settings-modal dark" : "settings-modal"}
    >
      <Modal.Header>Settings</Modal.Header>
      <Modal.Content scrolling>
        <Header>Display</Header>
        <Grid centered columns={3}>
          <Grid.Row>
            <Grid.Column className="fourteen wide">
              Include weekend service&nbsp;
              <Popup
                inverted={isDarkMode}
                content="Allow puzzles to use weekend service patterns"
                position="bottom center"
                trigger={
                  <Icon
                    inverted={isDarkMode}
                    name="question circle outline"
                    size="large"
                    link
                  />
                }
              />
            </Grid.Column>
            <Grid.Column className="two wide">
              <Checkbox
                toggle
                className="float-right"
                name="includeWeekendToggle"
                onChange={weekendToggleChanged}
                checked={settings.gameplay.includeWeekend}
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column className="fourteen wide">
              Show answer status badges&nbsp;
              <Popup
                inverted={isDarkMode}
                content="Having trouble seeing the difference in the colors? Turn on status badges!"
                position="bottom center"
                trigger={
                  <Icon
                    inverted={isDarkMode}
                    name="question circle outline"
                    size="large"
                    link
                    onHover={showAnswerStatusBadgesHoverDetail}
                  />
                }
              />
            </Grid.Column>
            <Grid.Column className="two wide">
              <Checkbox
                toggle
                className="float-right"
                name="showAnswerStatusBadgesToggle"
                onChange={showAnswerStatusBadgesToggleChanged}
                checked={settings.display.showAnswerStatusBadges}
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column className="fourteen wide">Dark mode</Grid.Column>
            <Grid.Column className="two wide">
              <Checkbox
                toggle
                className="float-right"
                name="darkModeToggle"
                onChange={darkModeToggleChanged}
                checked={settings.display.darkMode}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Modal.Content>
    </Modal>
  );
};

const showAnswerStatusBadgesHoverDetail = () => {};

export default SettingsModal;
