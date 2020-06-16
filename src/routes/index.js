import { memberRouter } from './member';
import { fbRouter } from './fbstore';


export const initializeRoutes = (app) => {
  app.use('/member', memberRouter);
  app.use('/fb', fbRouter);
};


export const initializeErrorRoutes = (app) => {
  // catch 404 and forward to error handler
  app.use((req, res) => res.status(404).send());

  // error handler
  app.use((err, req, res) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    return res.status(err.status || 500).send();
  });
};
