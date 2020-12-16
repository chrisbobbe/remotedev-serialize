var helpers = require('../helpers');
var mark = helpers.mark;
var extract = helpers.extract;
var refer = helpers.refer;
var options= require('../constants/options');

module.exports = function serialize(Immutable, refs, customReplacer, customReviver) {
  // zulip-mobile note: We save some computation by commenting out
  // replace/revive logic for ImmutableJS data structures we don't
  // use. If uncommenting one, be sure to uncomment it in both
  // `replacer` and `reviver`.
  function replacer(key, value) {
    // if (value instanceof Immutable.Record) return refer(value, 'ImmutableRecord', 'toObject', refs);
    // if (value instanceof Immutable.Range) return extract(value, 'ImmutableRange');
    // if (value instanceof Immutable.Repeat) return extract(value, 'ImmutableRepeat');
    // if (Immutable.OrderedMap.isOrderedMap(value)) return mark(value, 'ImmutableOrderedMap', 'toObject');
    if (Immutable.Map.isMap(value)) return mark(value, 'ImmutableMap', 'toObject');
    // if (Immutable.List.isList(value)) return mark(value, 'ImmutableList', 'toArray');
    // if (Immutable.OrderedSet.isOrderedSet(value)) return mark(value, 'ImmutableOrderedSet', 'toArray');
    // if (Immutable.Set.isSet(value)) return mark(value, 'ImmutableSet', 'toArray');
    // if (Immutable.Seq.isSeq(value)) return mark(value, 'ImmutableSeq', 'toArray');
    // if (Immutable.Stack.isStack(value)) return mark(value, 'ImmutableStack', 'toArray');
    if (typeof value === 'object' && value !== null && '__serializedType__' in value) {
      var copy = Object.assign({}, value);
      delete copy.__serializedType__;
      return {
        __serializedType__: 'Object',
        data: copy,
        __serializedType__value: value.__serializedType__,
      }
    }
    return value;
  }

  // zulip-mobile note: We save some computation by commenting out
  // replace/revive logic for ImmutableJS data structures we don't
  // use. If uncommenting one, be sure to uncomment it in both
  // `replacer` and `reviver`.
  function reviver(key, value) {
    if (typeof value === 'object' && value !== null && '__serializedType__'  in value) {
      var data = value.data;
      switch (value.__serializedType__) {
        case 'ImmutableMap': return Immutable.Map(data);
        // case 'ImmutableOrderedMap': return Immutable.OrderedMap(data);
        // case 'ImmutableList': return Immutable.List(data);
        // case 'ImmutableRange': return Immutable.Range(data._start, data._end, data._step);
        // case 'ImmutableRepeat': return Immutable.Repeat(data._value, data.size);
        // case 'ImmutableSet': return Immutable.Set(data);
        // case 'ImmutableOrderedSet': return Immutable.OrderedSet(data);
        // case 'ImmutableSeq': return Immutable.Seq(data);
        // case 'ImmutableStack': return Immutable.Stack(data);
        // case 'ImmutableRecord':
        //   return refs && refs[value.__serializedRef__]
        //     ? new refs[value.__serializedRef__](data)
        //     : Immutable.Map(data);
        case 'Object':
          return Object.assign({}, data, {
            __serializedType__: value.__serializedType__value,
          });
        default: return data;
      }
    }
    return value;
  }

  return {
    replacer: customReplacer
      ? function(key, value) {
        return customReplacer(key, value, replacer);
      }
      : replacer,
    reviver: customReviver
      ? function(key, value) {
        return customReviver(key, value, reviver);
      }
      : reviver,
    options: options
  }   
};
