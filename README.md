# homebridge-blinds-rf
A Homebridge plugin to control motorized blinds with 433MHz RF using Pilight raw codes

*inspired by homebridge-blinds-udp by nitaybz

# config.json

```
{
        "accessory": "BlindsRF",
        "name": "My Blinds",
        "host": "192.168.0.X",
        "port": 80,
        "up_rawcode": "874652395hjui4d98523",
        "down_rawcode": "8932y4123545j5k245325",
        "stop_rawcode": "43523632641512",
        "motion_time": "5000"
}
```

## Configuration Params

|             Parameter            |                       Description                       | Required |
| -------------------------------- | ------------------------------------------------------- |:--------:|
| `name`                           | name of the accessory                                   |     ✓    |
| `host`                           | endpoint for whatever is receiving these requests       |     ✓    |
| `port`                           | port of destination                                     |     ✓    |
| `up_rawcode`                     | raw rf (pilight) code for the up state (open)           |     ✓    |
| `down_rawcode`                   | raw rf (pilight) code for the down state  (close)       |     ✓    |
| `stop_rawcode`                   | raw rf (pilight) code for the stop state                |     ✓    |
| `motion_time`                    | time which your blind needs to move from up to down (ms)|     ✓    |

## Help

  - Make sure to specify a port and host in the config file.

## Installation

1. Install homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-blinds-rf`
3. Update your config file
