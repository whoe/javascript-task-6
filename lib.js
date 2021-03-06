'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Bad filter');
    }
    this._friends = friends;
    this._filter = filter;
    this._prepare(this._maxLevel);
}

Object.assign(Iterator.prototype, {
    done() {
        return this._current === this._filtredInvited.length;
    },
    next() {
        if (this._current < this._filtredInvited.length) {
            return this._filtredInvited[this._current++];
        }

        return null;
    },
    _filtredInvited: [],
    _current: 0,

    /**
     * Подготавливает массив filtredInvited для функции next и done
     * @param {Number} maxLevel
     */
    _prepare(maxLevel) {
        if (maxLevel === undefined) {
            maxLevel = Number.MAX_SAFE_INTEGER;
        }
        let currentLevel = this._friends
            .filter(friend => friend.best)
            .sort(alphabetOrder);
        let invitedFriends = [];
        let level = 1;
        while (level <= maxLevel && currentLevel.length > 0) {
            invitedFriends = invitedFriends.concat(currentLevel);
            let nextLevel = this._getNextLevel(currentLevel, invitedFriends)
                .sort(alphabetOrder);
            currentLevel = nextLevel;
            level++;
        }
        this._filtredInvited = this._filter.useFilter(invitedFriends);
    },

    _getNextLevel(currentLevel, invitedFriends) {
        let invitedFriendNames = invitedFriends.map(friend => friend.name);

        return currentLevel
            .reduce((nextFriendNames, currentFriend) =>
                nextFriendNames.concat(
                    currentFriend.friends
                        .filter(nextFriendName =>
                            !nextFriendNames.includes(nextFriendName) &&
                            !invitedFriendNames.includes(nextFriendName))
                ), [])
            .map(friendName => this._friends.find(friend => friend.name === friendName));
    }
});

function alphabetOrder(a, b) {
    if (a.name === b.name) {
        return 0;
    }
    if (a.name < b.name) {
        return -1;
    }

    return 1;
}

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    this._maxLevel = maxLevel;
    Iterator.call(this, friends, filter);
}

Object.setPrototypeOf(LimitedIterator.prototype, Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    // Nothing
}

/**
 * @this
 */
Object.assign(Filter.prototype, {
    condition: () => true,
    useFilter(friends) {
        return friends.filter(this.condition);
    }
});

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    // Nothing
}

Object.setPrototypeOf(MaleFilter.prototype, Filter.prototype);
Object.assign(MaleFilter.prototype, {
    condition: x => x.gender === 'male'
});

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    // Nothing
}

Object.setPrototypeOf(FemaleFilter.prototype, Filter.prototype);
Object.assign(FemaleFilter.prototype, {
    condition: x => x.gender === 'female'
});

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
