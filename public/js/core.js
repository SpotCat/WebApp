var spotcatApp = angular.module('spotcatApp', ['ngResource']);

spotcatApp.factory('api', ['$resource',
    function($resource) {
        return {
            GetCategories: $resource('/api/getCategories'),
            GetCategoriesById: $resource('/api/getCategoriesById/:spotifyId'),
            GetCategoriesByName: $resource('/api/getCategoriesByName/:name'),
            GetTopCategories: $resource('/api/getTopCategories'),
            IncrementCategory: $resource('/api/incrementCategoryCount'),
            CreateCategory: $resource('/api/createCategory')
        }
    }
]);

spotcatApp.controller('IndexCtrl', ['$http', '$scope', 'api',
    function($http, $scope, api) {
        var baseurl = 'https://api.spotify.com';

        $scope.fetchArtists = function() {
            if(!$scope.artistSearchText) return;
            $scope.loadingSearch = true;
            var url = baseurl + '/v1/search?limit=50&type=artist&query=' +
                $scope.artistSearchText.replace(' ', '%20');
            $http.get(url).then($scope.fetchArtistsCallback);
        };

        $scope.fetchArtistsCallback = function(response) {
            $scope.artistResults = response.data.artists.items;
            $scope.loadingSearch = false;
            return response.data.artists.items;
        };

        $scope.selectArtist = function(artist) {
            $scope.currentArtist = artist;
            $scope.currentAlbum = '';
            $scope.currentAlbumTracks = '';
            $http.get(baseurl + '/v1/artists/' + artist.id + '/albums')
                .then($scope.selectArtistCallback);
        };

        $scope.selectArtistCallback = function(response) {
            $scope.currentArtistAlbums = response.data.items;
            $scope.albumCategories = {};
            angular.forEach($scope.currentArtistAlbums, function(album) {
                api.GetCategoriesById.query({spotifyId: album.id}, function(resp) {
                    $scope.albumCategories[album.id] = resp;
                });
            });
        };

        $scope.selectAlbum = function(album) {
            $scope.currentAlbum = album;
            $http.get(baseurl + '/v1/albums/' + album.id + '/tracks')
                .then($scope.selectAlbumCallback)
        };

        $scope.selectAlbumCallback = function(response) {
            $scope.currentAlbumTracks = response.data.items;
            $scope.trackCategories = {};
            angular.forEach($scope.currentAlbumTracks, function(track) {
                api.GetCategoriesById.query({spotifyId: track.id}, function(resp) {
                    $scope.trackCategories[track.id] = resp;
                });
            });
        };

        $scope.backFromAlbum = function() {
            $scope.currentAlbumTracks = '';
        };

        $scope.backFromCategory = function() {
            $scope.categoriesByName = '';
        };

        $scope.createCategory = function(id, type) {
            var name = $('#' + id).val().toLowerCase();
            if(!name.length) {
                $scope.errorText = 'Enter a name!';
                return;
            }
            $scope.errorText = '';

            var catExists = false;
            if(type == 'album') {
                angular.forEach($scope.albumCategories[id], function (existingCat) {
                    if (existingCat.categoryName == name) {
                        catExists = true;
                    }
                });
            } else if (type == 'track') {
                angular.forEach($scope.trackCategories[id], function (existingCat) {
                    if (existingCat.categoryName == name) {
                        catExists = true;
                    }
                });
            }

            if(!catExists)
                api.CreateCategory.save({name: name, id: id, type: type},
                    function(resp) {
                        if(type == 'album')
                            $scope.albumCategories[id].push({categoryName: name, count: 1, local:true});
                        else if(type == 'track')
                            $scope.trackCategories[id].push({categoryName: name, count: 1, local:true});
                    },
                    function(err) {
                        $scope.errorText = 'Something went wrong...';
                    }
                );
        };

        $scope.incrementCategory = function(cat) {
            api.IncrementCategory.save({id: cat._id},
                function() {
                    cat.count++;
                    cat['incremented'] = true;
                    $scope.errorText = '';
                },
                function() {
                    $scope.errorText = 'Something went wrong, please try again.';
                }
            )
        };

        $scope.getTopCategories = function() {
            $scope.categoriesByName = '';
            api.GetTopCategories.query({}, function(resp) {
                $scope.topCategories = resp;
                angular.forEach($scope.topCategories, function(category) {
                    if(category.type == 'album') {
                        $http.get('https://api.spotify.com/v1/albums/' + category.spotifyID).then(function(resp) {
                            category['info'] = resp.data;
                        })
                    } else {
                        $http.get(baseurl + '/v1/tracks/' + category.spotifyID).then(function(resp) {
                            category['info'] = resp.data;
                        })
                    }
                })
            });


        };
    }
]).

directive('sidebar', function() {
    return {
        controller: 'IndexCtrl',
        restrict: 'E',
        replace: true,
        templateUrl: '../sidebar.html'
    }
}).

directive('navbar', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '../navbar.html'
    }
}).

directive('indexBody', function() {
    return {
        controller: 'IndexCtrl',
        restrict: 'E',
        replace: true,
        templateUrl: '../body.html'
    }
});