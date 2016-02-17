module.exports = [
    '$scope',
    '$rootScope',
    '$translate',
    '$location',
    '$route',
    'UserEndpoint',
    'Notify',
    '_',
    'RoleEndpoint',
function (
    $scope,
    $rootScope,
    $translate,
    $location,
    $route,
    UserEndpoint,
    Notify,
    _,
    RoleEndpoint
) {
    $translate('user.add_user').then(function (title) {
        $scope.title = title;
        $rootScope.$emit('setPageTitle', title);
    });

    $scope.user = {};
    $scope.processing = false;

    $scope.saveUser = function (user, addAnother) {
        $scope.processing = true;
        var whereToNext = '/settings/users';

        UserEndpoint.saveCache(user).$promise.then(function (response) {
            if (response.id) {
                $translate('notify.user.save_success', {name: user.realname}).then(function (message) {
                    Notify.showNotificationSlider(message);
                });
                $scope.processing = false;
                $scope.userSavedUser = true;
                $scope.user.id = response.id;
                addAnother ? $route.reload() : $location.path(whereToNext);
            }
        }, function (errorResponse) { // error
            var validationErrors = [];
            // @todo refactor limit handling
            _.each(errorResponse.data.errors, function (value, key) {
                // Ultimately this should check individual status codes
                // for the moment just check for the message we expect
                if (value.title === 'limit::admin') {
                    $translate('limit.admin_limit_reached').then(function (message) {
                        Notify.showLimitSlider(message);
                    });
                } else {
                    validationErrors.push(value);
                }
            });

            Notify.showApiErrors(validationErrors);
            $scope.processing = false;
        });
    };

    RoleEndpoint.query().$promise.then(function (roles) {
        $scope.roles = roles;
    });
}];
