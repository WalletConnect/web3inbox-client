import "./AppNotificationsEmpty.scss";

const AppNotificationsEmpty: React.FC = () => {
  return (
    <div className="AppNotificationsEmpty">
      <div className="AppNotificationsEmpty__wrapper">
        <p className="AppNotificationsEmpty__title">No notifications yet</p>
        <p className="AppNotificationsEmpty__subtitle">
          Notifications will show up here
        </p>
      </div>
    </div>
  );
};

export default AppNotificationsEmpty;
