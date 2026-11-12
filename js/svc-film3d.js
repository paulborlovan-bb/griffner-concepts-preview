/* Runde 56 (Kunde, 2026-11-12): der Film der Services Übersicht eins zu eins aus dem Entwurf „GRIFFNER Services v2“ (Claude Design),
   mit dem Haus des Entwurfs (Erdgeschoß in Stein mit Doppelgarage, darüber ein Satteldach-Körper in Lärche) und dem Einstieg
   „Hausbau ist komplex“ (Baustelle, Wörter im Raum, das Logo fliegt aus der Kopfzeile auf den Baucontainer).
   GEBAUT von tools/svc-film3d-aus-entwurf.mjs aus site/svc3d-scene.js und site/svc3d.js des Entwurfs, nicht von Hand ändern:
   Änderungen am Film im Entwurf machen, Dateien holen und das Werkzeug neu laufen lassen. Was das Werkzeug anpasst, steht dort oben. */
import * as T from 'three';

export const LOGO_INV = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAwIDEwMDUuNiIgd2lkdGg9IjEwMDAiIGhlaWdodD0iMTAwNS42IiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IkdSSUZGTkVSIiB4bWxuczpjMnBhPSJodHRwOi8vYzJwYS5vcmcvbWFuaWZlc3QiPgogIDx0aXRsZT5HUklGRk5FUiwgSGF1c3NjaG5pdHQsIGdlbGJlcyBGZWxkLCBXb3J0bWFya2Ugd2Vpc3MsIGZ1ZXIgc2Nod2FyemVuIEdydW5kPC90aXRsZT4KICA8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwMCIgaGVpZ2h0PSI4MDAiIGZpbGw9IiNGRkIyMDAiPjwvcmVjdD4KICA8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNMjUuNjE3NSw5NDMuNzIwMWMwLDExLjIwOTc1IDMuNTMzNjksMjAuMjEzNTEgMTAuNjUxMzcsMjcuMDM4NDRjNy4xNTU4MSw2Ljg2MTQ4IDE3LjE2MDY2LDEwLjc0MjM2IDMwLjg3MTAzLDEwLjc0MjM2YzQuOTY4MTUsMCA4LjUwNjk3LC0wLjgwNjEgMTIuMzY5MSwtMS45NjkzM2wwLC00Mi40NjIxN2gyNC45OTM5bDAsNTcuNzc3NDRsLTEuMjI2LDAuOTAxNDZjLTYuMDIzNTIsNC40MjkwMiAtMjEuMTI5OTIsOS44MTExIC0zNi45MTY1LDkuODExMWMtMjAuMjE3MzgsMCAtMzcuMTgzNjUsLTYuODUzNCAtNDguNTA5ODEsLTE3Ljc5NTI4Yy0xMS4zNTcyNCwtMTAuOTcxOSAtMTcuODUwNTksLTI2Ljg2MTE1IC0xNy44NTA1OSwtNDQuMDQ0MDJjMCwtMTguMjg2MzQgNy4wMTI1NywtMzUuMDM3MiAxOS4wODkzNSwtNDYuNTg4MDJjMTIuMDQ3NTQsLTExLjUyMjg1IDI5Ljk0MjY0LC0xOC42ODEwOCA1MS4wMTI2NSwtMTguNjgxMDhjMTMuMjg0MywwIDI2LjIwNzg3LDMuMDQ5MTEgMzMuOTUzOTUsNy40MjI4MmwxLjUzODI1LDAuODY4NTVsMCwyNS4wNDY1MWwtNC40NTcwOCwtMi4yODY0NmMtNy43MTA4OCwtMy45NTU2NCAtMTkuMDE5MTQsLTcuNDYwNjMgLTMwLjA5OTcyLC03LjQ2MDYzYy0xNC43MzQ1NSwwIC0yNS43MTc1Myw0LjE2NDE1IC0zMy41ODkyNiwxMS42NDc4M2MtNy44MzkxMiw3LjQ1MjY4IC0xMS44MzA2NCwxNy40MjY5MyAtMTEuODMwNjQsMzAuMDMwNDd6IE0yMDUuMjEzNTUsOTY2LjAwMjU3Yy0zLjM4OTM4LDAuMzUxNTUgLTYuMjM0ODEsMC41ODE4MyAtMTAuNzE3NTUsMC41ODE4M2MtNy42NTI0NCwwIC0xMC42OTUwOCwtMC4zODc2IC0xNC44NjM1LC0wLjk5NzU5djM3LjQ3ODE5aC0yNS4zMDU3bDAsLTEyMy4wNTVoNDYuNzE3YzE1Ljg3NjY3LDAuMDY1MjkgMjguODEwNTUsMy45MDc4NyAzNy4yOTQzMywxMC44Njc4NmM4LjU2OTEsNy4wMjk5OSAxMy4zMjAxNywxNy45MzI5OCAxMy4zMjAxNywzMC41NDg1NGMwLDkuMzgyMjUgLTIuMzkzOTgsMTcuODIyNjcgLTYuNjYwMzMsMjQuMzI1NzVjLTQuMjc3ODEsNi41MjA1NCAtOS4xMDM1NSwxMC4yNDY4NCAtMTUuNTM3MDEsMTMuNjAwOWwyNy4xMzcxNiw0My43MTE5NWgtMjguNzQzOTJ6TTIxOC41NTM0OSw5MzcuNzk2NGM0LjkxNjI3LC0zLjc1NjQ1IDYuODYzNywtOC42MDYxNSA2Ljg2MzcsLTE2LjA1ODJjMCwtNS45OTE2MSAtMS4yNzE4NywtOS45NjgxMyAtNS4xNDM1OSwtMTMuMTY5NDFjLTQuMDMyNjMsLTMuMzM0MzQgLTEwLjIyNTE0LC01LjE4NDY2IC0yMC43ODg4MSwtNS4xMjM4OWgtMTkuODUyM3YzOS4yNjQ4MWM0LjAwOTc5LDAuNjE0NjkgNy41MDQxNSwwLjkwNzQ5IDE0LjcwNzYsMC45MDc0OWMxMS42MTgyOSwwIDE5LjE1MDcxLC0xLjk1MjQ4IDI0LjIxMzQsLTUuODIwOHogTTMyNC4yOTM0OSw4ODAuMDFsMCwxMjMuMDU1aC0yNC45OTM5di0xMjMuMDU1eiBNNDAyLjg1Mjg5LDkwMy43NTY3djIyLjI0MzhsNDEuMTU3NiwwbDAsMjMuNzQ2N2wtNDEuMTU3NiwwdjUzLjMxNzhoLTI1LjMwNTdsMCwtMTIzLjA1NWw2OC4zMzQxLDBsMCwyMy43NDY3eiBNNTE2LjgwMTU5LDkwMy43NTY3djIyLjI0MzhsNDEuMTU3NiwwbDAsMjMuNzQ2N2wtNDEuMTU3NiwwdjUzLjMxNzhoLTI1LjMwNTdsMCwtMTIzLjA1NWw2OC4zMzQxLDBsMCwyMy43NDY3eiBNNzE1LjA5MjE4LDEwMDMuNjg4NmgtNy40MTIzOWwtNzcuMjQxMzEsLTczLjg0NDQ2bDAsNzMuMjIwODZoLTI0Ljk5MzlsMCwtMTIzLjgzNDVoNy4wODgxOWw3Ny40MDk2MSw3Mi45Nzc3N2wwLC03Mi4xOTgyN2wyNS4xNDk4LDB6IE04NDkuNzc1NTgsMTAwMy4wNjVoLTgyLjA1MzNsMCwtMTIzLjA1NWw4MC40OTQzLDBsMCwyMy43NDY3bC01Ni4xMjQsMHYyMi4yNDM4bDUzLjMxNzgsMHYyMy43NDY3bC01My4zMTc4LDB2MjkuNTcxMWw1Ny42ODMsMHogTTk0OC42MTU0Myw5NjYuMDAyNTdjLTMuMzg5MzgsMC4zNTE1NSAtNi4yMzQ4MSwwLjU4MTgzIC0xMC43MTc1NSwwLjU4MTgzYy03LjY1MjQ0LDAgLTEwLjY5NTA4LC0wLjM4NzYgLTE0Ljg2MzUsLTAuOTk3NTl2MzcuNDc4MTloLTI1LjMwNTdsMCwtMTIzLjA1NWg0Ni43MTdjMTUuODc2NjcsMC4wNjUyOSAyOC44MTA1NSwzLjkwNzg3IDM3LjI5NDMzLDEwLjg2Nzg2YzguNTY5MSw3LjAyOTk5IDEzLjMyMDE3LDE3LjkzMjk4IDEzLjMyMDE3LDMwLjU0ODU0YzAsOS4zODIyNSAtMi4zOTM5OCwxNy44MjI2NyAtNi42NjAzMywyNC4zMjU3NWMtNC4yNzc4MSw2LjUyMDU0IC05LjEwMzU1LDEwLjI0Njg0IC0xNS41MzcwMSwxMy42MDA5bDI3LjEzNzE2LDQzLjcxMTk1aC0yOC43NDM5MnpNOTYxLjk1NTM3LDkzNy43OTY0YzQuOTE2MjcsLTMuNzU2NDUgNi44NjM3LC04LjYwNjE1IDYuODYzNywtMTYuMDU4MmMwLC01Ljk5MTYxIC0xLjI3MTg3LC05Ljk2ODEzIC01LjE0MzU5LC0xMy4xNjk0MWMtNC4wMzI2MywtMy4zMzQzNCAtMTAuMjI1MTQsLTUuMTg0NjYgLTIwLjc4ODgxLC01LjEyMzg5aC0xOS44NTIzdjM5LjI2NDgxYzQuMDA5NzksMC42MTQ2OSA3LjUwNDE1LDAuOTA3NDkgMTQuNzA3NiwwLjkwNzQ5YzExLjYxODI5LDAgMTkuMTUwNzEsLTEuOTUyNDggMjQuMjEzNCwtNS44MjA4eiI+PC9wYXRoPgo8L3N2Zz4=";
const CLAIM_W = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MDUzIDk3NyIgd2lkdGg9IjEwMDAiIGhlaWdodD0iMTYxLjQxIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9ImJ1aWx0IGRpZmZlcmVudCwgd2Vpc3MiIHhtbG5zOmMycGE9Imh0dHA6Ly9jMnBhLm9yZy9tYW5pZmVzdCI+CiAgPHRpdGxlPmJ1aWx0IGRpZmZlcmVudCwgd2Vpc3M8L3RpdGxlPgogIDxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0yNzMgMjQ5IEMxODEgMjQ5IDExMCAyOTUgNzUgMzY5IEw3NSAxMSBMMCAxMSBMMCA1MDMgQzAgNjY2IDEwNiA3NzUgMjU3IDc3NSBDNDA4IDc3NSA1MTkgNjY0IDUxOSA1MTEgQzUxOSAzNjEgNDE0IDI0OSAyNzMgMjQ5IFogTTI1NyA3MDYgQzE1MiA3MDYgNzUgNjI3IDc1IDUxMiBDNzUgMzk3IDE1MSAzMjAgMjU3IDMyMCBDMzY3IDMyMCA0NDIgMzk3IDQ0MiA1MTIgQzQ0MiA2MjggMzY2IDcwNiAyNTcgNzA2IFogTTgzNyA3NzUgQzk3MSA3NzUgMTA1NiA2OTMgMTA1NiA1NTQgTDEwNTYgMjYzIEw5NzYgMjYzIEw5NzYgNTU1IEM5NzYgNjQ2IDkyMyA3MDQgODM3IDcwNCBDNzUyIDcwNCA2OTkgNjQ2IDY5OSA1NTUgTDY5OSAyNjMgTDYxOSAyNjMgTDYxOSA1NTQgQzYxOSA2OTMgNzA0IDc3NSA4MzcgNzc1IFogTTEyMzYgMTU1IEMxMjY5IDE1NSAxMjkwIDEzNiAxMjkwIDEwNCBDMTI5MCA2OCAxMjY5IDUwIDEyMzYgNTAgQzEyMDQgNTAgMTE4MSA2OCAxMTgxIDEwNCBDMTE4MSAxMzYgMTIwNCAxNTUgMTIzNiAxNTUgWiBNMTE5NSA3NjEgTDEyNzUgNzYxIEwxMjc1IDI2MyBMMTE5NSAyNjMgWiBNMTUxNCA3NzUgQzE1MzQgNzc1IDE1NTQgNzcwIDE1NjYgNzYxIEwxNTY2IDY5OCBDMTU1OCA3MDQgMTU0NiA3MDYgMTUzNCA3MDYgQzE1MTMgNzA2IDE1MDEgNjk0IDE1MDEgNjcwIEwxNTAxIDExIEwxNDIxIDExIEwxNDIxIDY3OSBDMTQyMSA3MzkgMTQ1NyA3NzUgMTUxNCA3NzUgWiBNMTkyNCAzMzMgTDE5MjQgMjYzIEwxNzY5IDI2MyBMMTc2OSAxMDkgTDE2OTAgMTA5IEwxNjkwIDI2MyBMMTYwMCAyNjMgTDE2MDAgMzMzIEwxNjkwIDMzMyBMMTY5MCA2MDEgQzE2OTAgNzExIDE3NDYgNzc1IDE4NDQgNzc1IEMxODcyIDc3NSAxOTA1IDc2OCAxOTI0IDc1OCBMMTkyNCA2ODUgQzE5MDggNjk0IDE4ODEgNzAxIDE4NTcgNzAxIEMxNzk4IDcwMSAxNzY5IDY2NiAxNzY5IDYwMSBMMTc2OSAzMzMgWiBNMjYzMiAxMSBMMjYzMiAzNTggQzI1OTUgMjg3IDI1MzEgMjQ5IDI0NTQgMjQ5IEMyMzE5IDI0OSAyMjE2IDM2MCAyMjE2IDUxMyBDMjIxNiA2NjcgMjMxOCA3NzUgMjQ1MyA3NzUgQzI1MzUgNzc1IDI2MDEgNzMzIDI2MzcgNjU2IEwyNjM3IDc2MSBMMjcxMiA3NjEgTDI3MTIgMTEgWiBNMjQ2NyA3MDUgQzIzNjcgNzA1IDIyOTQgNjMxIDIyOTQgNTEzIEMyMjk0IDM5NiAyMzY4IDMyMCAyNDY3IDMyMCBDMjU2OCAzMjAgMjY0NCAzOTcgMjY0NCA1MTMgQzI2NDQgNjI4IDI1NjggNzA1IDI0NjcgNzA1IFogTTI4OTMgMTU1IEMyOTI2IDE1NSAyOTQ3IDEzNiAyOTQ3IDEwNCBDMjk0NyA2OCAyOTI2IDUwIDI4OTMgNTAgQzI4NjEgNTAgMjgzOCA2OCAyODM4IDEwNCBDMjgzOCAxMzYgMjg2MSAxNTUgMjg5MyAxNTUgWiBNMjg1MiA3NjEgTDI5MzIgNzYxIEwyOTMyIDI2MyBMMjg1MiAyNjMgWiBNMzAzMCA2OSBDMzA5NiA2OSAzMTI3IDEwMyAzMTI3IDE2OCBMMzEyNyAyNjMgTDI5ODIgMjYzIEwyOTgyIDMzMyBMMzEyNyAzMzMgTDMxMjcgNzg0IEMzMTI3IDkwNCAzMTgxIDk3NyAzMjg5IDk3NyBDMzMxNiA5NzcgMzM0MSA5NzEgMzM1OSA5NjEgTDMzNTggODkxIEMzMzQxIDkwMCAzMzIyIDkwNiAzMjk5IDkwNiBDMzIzMCA5MDYgMzIwNiA4NjIgMzIwNiA3ODQgTDMyMDYgMzMzIEwzMzE3IDMzMyBMMzMxNyAyNjMgTDMyMDYgMjYzIEwzMjA2IDE2NyBDMzIwNiA2MiAzMTQ1IDAgMzA0MCAwIEMzMDExIDAgMjk4OCA1IDI5NzAgMTIgTDI5NzAgNzggQzI5ODYgNzMgMzAwNiA2OSAzMDMwIDY5IFogTTMzNjIgNjkgQzM0MjggNjkgMzQ1OSAxMDMgMzQ1OSAxNjggTDM0NTkgMjYzIEwzMzE0IDI2MyBMMzMxNCAzMzMgTDM0NTkgMzMzIEwzNDU5IDc4NCBDMzQ1OSA5MDQgMzUxMyA5NzcgMzYyMSA5NzcgQzM2NDggOTc3IDM2NzMgOTcxIDM2OTEgOTYxIEwzNjkwIDg5MSBDMzY3MyA5MDAgMzY1NCA5MDYgMzYzMSA5MDYgQzM1NjIgOTA2IDM1MzggODYyIDM1MzggNzg0IEwzNTM4IDMzMyBMMzY0OSAzMzMgTDM2NDkgMjYzIEwzNTM4IDI2MyBMMzUzOCAxNjcgQzM1MzggNjIgMzQ3NyAwIDMzNzIgMCBDMzM0MyAwIDMzMjAgNSAzMzAyIDEyIEwzMzAyIDc4IEMzMzE4IDczIDMzMzggNjkgMzM2MiA2OSBaIE00MTc5IDQ5MyBDNDE3OSAzNDQgNDA5MCAyNDkgMzk1MiAyNDkgQzM4MTIgMjQ5IDM3MDkgMzU0IDM3MDkgNTEwIEMzNzA5IDY3NyAzODA4IDc3NSAzOTcwIDc3NSBDNDAzNCA3NzUgNDEwNyA3NjAgNDE1NSA3MjYgTDQxNTUgNjU2IEM0MTE1IDY4NCA0MDUyIDcwNiAzOTc3IDcwNiBDMzg2MiA3MDYgMzc5NiA2NTAgMzc4NiA1MzcgTDQxNzUgNTM3IEM0MTc3IDUyMyA0MTc5IDUwOCA0MTc5IDQ5MyBaIE0zOTUxIDMxNiBDNDA0OSAzMTYgNDEwMSAzNzYgNDEwNSA0NzMgTDM3ODcgNDczIEMzNzk5IDM3MyAzODYzIDMxNiAzOTUxIDMxNiBaIE00NTIxIDI0OSBDNDQzNiAyNDkgNDM3OSAzMDggNDM1OSAzNzQgTDQzNTkgMjYzIEw0Mjg0IDI2MyBMNDI4NCA3NjEgTDQzNjQgNzYxIEw0MzY0IDQ4MSBDNDM2NCAzNzYgNDQyOCAzMjIgNDUxMSAzMjIgQzQ1MzkgMzIyIDQ1NjYgMzI4IDQ1ODQgMzM4IEw0NTg0IDI2MCBDNDU2NyAyNTMgNDU0MiAyNDkgNDUyMSAyNDkgWiBNNTEwNCA0OTMgQzUxMDQgMzQ0IDUwMTUgMjQ5IDQ4NzcgMjQ5IEM0NzM3IDI0OSA0NjM0IDM1NCA0NjM0IDUxMCBDNDYzNCA2NzcgNDczMyA3NzUgNDg5NSA3NzUgQzQ5NTkgNzc1IDUwMzIgNzYwIDUwODAgNzI2IEw1MDgwIDY1NiBDNTA0MCA2ODQgNDk3NyA3MDYgNDkwMiA3MDYgQzQ3ODcgNzA2IDQ3MjEgNjUwIDQ3MTEgNTM3IEw1MTAwIDUzNyBDNTEwMiA1MjMgNTEwNCA1MDggNTEwNCA0OTMgWiBNNDg3NiAzMTYgQzQ5NzQgMzE2IDUwMjYgMzc2IDUwMzAgNDczIEw0NzEyIDQ3MyBDNDcyNCAzNzMgNDc4OCAzMTYgNDg3NiAzMTYgWiBNNTQ2MyAyNDkgQzUzNzIgMjQ5IDUzMDggMzA0IDUyODQgMzcxIEw1Mjg0IDI2MyBMNTIwOSAyNjMgTDUyMDkgNzYxIEw1Mjg5IDc2MSBMNTI4OSA0OTggQzUyODkgMzg3IDUzNTIgMzE0IDU0NDEgMzE0IEM1NTI3IDMxNCA1NTc5IDM3OCA1NTc5IDQ4MiBMNTU3OSA3NjEgTDU2NTkgNzYxIEw1NjU5IDQ2NiBDNTY1OSAzMzAgNTU4MSAyNDkgNTQ2MyAyNDkgWiBNNjA1MyAzMzMgTDYwNTMgMjYzIEw1ODk4IDI2MyBMNTg5OCAxMDkgTDU4MTkgMTA5IEw1ODE5IDI2MyBMNTcyOSAyNjMgTDU3MjkgMzMzIEw1ODE5IDMzMyBMNTgxOSA2MDEgQzU4MTkgNzExIDU4NzUgNzc1IDU5NzMgNzc1IEM2MDAxIDc3NSA2MDM0IDc2OCA2MDUzIDc1OCBMNjA1MyA2ODUgQzYwMzcgNjk0IDYwMTAgNzAxIDU5ODYgNzAxIEM1OTI3IDcwMSA1ODk4IDY2NiA1ODk4IDYwMSBMNTg5OCAzMzMgWiI+PC9wYXRoPgo8L3N2Zz4=";
const FOC = {
  dach: { cam: [62, 24, 52, -1, 6.5, 4.5], fx: { roof: 1 } },
  wand: { cam: [28, 13, 34, 1.6, 1.6, 8.5], fx: { wall: 1 } },
  fenster: { cam: [10, 26, 13, 1.5, 1.2, -5.0] },
  fassade: { cam: [84, 10, 34, 4.9, 4.6, 0] },
  hoehe: { cam: [30, 12, 42, 3, 1.6, 8.15], fx: { dims: 1 } },
  open: { cam: [60, 62, 40, 0, .5, 1.3] },
  parkett: { cam: [50, 44, 22, 1.4, .3, -1.2] },
  fliesen: { cam: [40, 56, 20, -5.8, .3, -3.6] },
  bad: { cam: [30, 55, 22, -6.6, .5, -4] },
  tuer: { cam: [70, 34, 16, -5.6, 1.2, -1.6] }
};
/* Runde 58: weiche Verläufe und Masken als Pixeldaten statt 2D Canvas. Safari 26 (iOS, iPadOS, macOS) verrauscht 2D Canvas beim Auslesen
   (Advanced Fingerprinting Protection, seit Safari 26 in jedem Fenster an). Auf den großen additiven Lichtkreisen am Boden wurde das als bunte Punkte
   sichtbar. f bekommt Canvas Koordinaten (y von oben), die Zeilen werden wie bei CanvasTexture (flipY) gelegt. */
const datTex = (w, h, f, mip = true) => { const d = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const p = f(x + .5, h - y - .5), i = (y * w + x) * 4; d[i] = p[0]; d[i + 1] = p[1]; d[i + 2] = p[2]; d[i + 3] = Math.round(p[3]); }
  const t = new T.DataTexture(d, w, h, T.RGBAFormat); t.magFilter = T.LinearFilter; t.minFilter = mip ? T.LinearMipmapLinearFilter : T.LinearFilter; t.generateMipmaps = mip; t.needsUpdate = true; return t; };
const lerpS = (s, v) => { if (v <= s[0][0]) return s[0][1]; for (let i = 1; i < s.length; i++) if (v <= s[i][0]) { const a = s[i - 1], b = s[i]; return a[1] + (b[1] - a[1]) * (v - a[0]) / (b[0] - a[0]); } return s[s.length - 1][1]; };
const radTex = (n, s) => { const t = datTex(n, n, (x, y) => [255, 255, 255, 255 * lerpS(s, Math.hypot(x - n / 2, y - n / 2) / (n / 2))]); t.colorSpace = T.SRGBColorSpace; return t; };
/* Lichtkegel vor der Haustür: Trapez mit weichem Rand (wie blur 7px) und Verlauf nach unten */
const spillTex = () => { const P = [[42, 4], [86, 4], [122, 252], [6, 252]], E = P.map((a, i) => { const b = P[(i + 1) % 4], l = Math.hypot(b[0] - a[0], b[1] - a[1]); let nx = (a[1] - b[1]) / l, ny = (b[0] - a[0]) / l; if ((64 - a[0]) * nx + (128 - a[1]) * ny < 0) { nx = -nx; ny = -ny; } return [a[0], a[1], nx, ny]; });
  const cdf = z => .5 * (1 + Math.tanh(.7978845608 * (z + .044715 * z * z * z)));
  const t = datTex(128, 256, (x, y) => { let d = 1e9; for (const e of E) d = Math.min(d, (x - e[0]) * e[2] + (y - e[1]) * e[3]); return [255, 214, 166, 255 * cdf(d / 7) * lerpS([[0, 1], [.35, .55], [1, 0]], y / 256)]; }); t.colorSpace = T.SRGBColorSpace; return t; };
/* Logos auf Baucontainer und Bus: das SVG direkt als Bild in Pixelgröße w x h, ohne 2D Canvas (sonst bunte Ränder um die Schrift) */
const svgTex = (url, w, h) => { const t = new T.Texture(); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4;
  const s = atob(url.split(',')[1]).replace(/<svg\b([^>]*)>/, (m, a) => '<svg' + a.replace(/\s(width|height|preserveAspectRatio)="[^"]*"/g, '') + ' width="' + w + '" height="' + h + '" preserveAspectRatio="none">');
  const img = new Image(); img.onload = () => { t.image = img; t.needsUpdate = true; }; img.src = 'data:image/svg+xml;base64,' + btoa(s); return t; };

/* GRIFFNER Services v2: Szene als Architekturmodell. Einheiten in Metern, y oben.
   Jede "Einheit" (unit) ist eine Ebene der Explosionszeichnung und landet in ihrem Kapitel. */
function buildScene(T) {
  const C = { weiss: 0xEAE8E3, sand: 0xCFC3B3, kalk: 0xCACACA, beton: 0xB9B7B2, anth: 0x444442, ground: 0x242423, gelb: 0xFFB200, salbei: 0x8B907C, glas: 0x0b0c0d, schwarz: 0x000000 };
  const GAP = 11.5;
  const grp = (parent, name) => { const g = new T.Group(); g.name = name; g.userData.mats = []; if (parent) parent.add(g); return g; };
  const M = (g, color, o = {}) => { const m = new T.MeshStandardMaterial({ color, roughness: o.r ?? .9, metalness: o.m ?? 0, emissive: o.em ?? 0, emissiveIntensity: o.ei ?? 0, side: o.side ?? T.FrontSide, map: o.map || null }); m.userData.base = o.op ?? 1; if (o.glass || (o.m >= .85 && o.r <= .05)) m.userData.glass = 1; g.userData.mats.push(m); return m; };
  const LM = (g, color, op = 1, dashed) => { const m = dashed ? new T.LineDashedMaterial({ color, dashSize: .55, gapSize: .4, transparent: true, opacity: op }) : new T.LineBasicMaterial({ color, transparent: true, opacity: op }); m.userData.base = op; g.userData.mats.push(m); return m; };
  const BM = (g, color, op = 1) => { const m = new T.MeshBasicMaterial({ color, transparent: true, opacity: op, side: T.DoubleSide, depthWrite: false }); m.userData.base = op; g.userData.mats.push(m); return m; };
  const box = (g, x0, y0, z0, x1, y1, z1, mat, em) => {
    const geo = new T.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m = new T.Mesh(geo, mat);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); m.castShadow = m.receiveShadow = true;
    if (em) m.add(new T.LineSegments(new T.EdgesGeometry(geo), em));
    g.add(m); return m;
  };
  const wire = (g, x0, y0, z0, x1, y1, z1, mat) => { const geo = new T.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), l = new T.LineSegments(new T.EdgesGeometry(geo), mat); l.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); if (mat.isLineDashedMaterial) l.computeLineDistances(); g.add(l); return l; };
  const segs = (g, arr, mat) => { const p = []; arr.forEach(s => p.push(new T.Vector3(s[0], s[1], s[2]), new T.Vector3(s[3], s[4], s[5]))); const l = new T.LineSegments(new T.BufferGeometry().setFromPoints(p), mat); if (mat.isLineDashedMaterial) l.computeLineDistances(); g.add(l); return l; };
  const loop = (g, pts, mat) => { const p = pts.map(v => new T.Vector3(v[0], v[1], v[2])); p.push(p[0].clone()); const l = new T.Line(new T.BufferGeometry().setFromPoints(p), mat); if (mat.isLineDashedMaterial) l.computeLineDistances(); g.add(l); return l; };
  const A = {};
  const anchor = (g, id, x, y, z) => { const o = new T.Object3D(); o.position.set(x, y, z); g.add(o); A[id] = o; return o; };
  const tex = (draw, w = 512, h = 512, rep = [1, 1]) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.anisotropy = 8; return t; };

  const pivot = new T.Group(), root = new T.Group();
  pivot.add(root);
  const units = [];
  const unit = (id, e, landP, delay) => { const g = grp(root, id); g.userData.e = e; g.userData.landP = landP; g.userData.delay = delay; g.userData.base = new T.Vector3(); units.push(g); return g; };

  /* Grundstück */
  const grund = unit('grund', 0, 4, 0);
  const gm = M(grund, C.ground, { r: 1 }), ge = LM(grund, C.kalk, .45);
  box(grund, -16, -1.4, -12, 16, 0, -1, gm, ge);
  const front = grp(grund, 'front');
  const fm = M(front, C.ground, { r: 1 }), fe = LM(front, C.kalk, .45);
  box(front, -16, -1.4, -1, 16, 0, 12, fm, fe);
  const street = M(grund, 0x141414, { r: 1 });
  box(grund, -26, -1.4, 13, 26, -.08, 18.5, street);
  segs(grund, [[-26, -.07, 15.75, 26, -.07, 15.75]], LM(grund, C.kalk, .35, true));
  const pm0 = M(grund, C.kalk);
  [[-16, -12], [16, -12], [16, 12], [-16, 12]].forEach(([x, z]) => box(grund, x - .08, 0, z - .08, x + .08, 1, z + .08, pm0));
  anchor(grund, 'lay-grund', 17, 0, 6);

  /* Projektcheck: Vermessung, Scan */
  const check = grp(grund, 'check');
  const scanM = BM(check, 0xFFFFFF, .1);
  const scan = new T.Mesh(new T.PlaneGeometry(24.5, 7), scanM); scan.rotation.y = Math.PI / 2; scan.position.set(-16, 3.5, 0); check.add(scan);
  const scanEdge = segs(check, [[0, 0, -12.25, 0, 0, 12.25], [0, 7, -12.25, 0, 7, 12.25]], LM(check, 0xFFFFFF, .7)); scanEdge.position.set(-16, 0, 0);
  const ptsGeo = new T.BoxGeometry(.2, .2, .2), ptsMat = BM(check, 0xFFFFFF, 1);
  const pts = []; for (let x = -14; x <= 14; x += 2) for (let z = -10; z <= 10; z += 2) pts.push([x, z]);
  const ptsMesh = new T.InstancedMesh(ptsGeo, ptsMat, pts.length); check.add(ptsMesh);
  const dimM = LM(check, 0xFFFFFF, .9);
  segs(check, [[-16, .02, 13, 16, .02, 13], [-16, .02, 12.5, -16, .02, 13.5], [16, .02, 12.5, 16, .02, 13.5], [17, .02, -12, 17, .02, 12], [16.5, .02, -12, 17.5, .02, -12], [16.5, .02, 12, 17.5, .02, 12]], dimM);
  loop(check, [[-13, .03, -10.4], [13, .03, -10.4], [13, .03, 10.4], [-13, .03, 10.4]], LM(check, 0xFFFFFF, .8, true));
  segs(check, [[-12.6, 0, 3, -12.6, -3.5, 3]], LM(check, 0xFFFFFF, .9, true));
  anchor(check, 'dimx', 0, .1, 14.2); anchor(check, 'dimz', 18.2, .1, 0); anchor(check, 'bau', -13, .1, -11); anchor(check, 'boden', -12.6, -3.8, 3); anchor(check, 'flaeche', 0, .1, 0);

  /* Haus: Erdgeschoß in Stein mit Doppelgarage, darüber ein Satteldach-Körper in Lärche (nach Grundriss 2G FRAME) */
  const EX0 = -9.5, EX1 = 5.9, EZ0 = -5.5, EZ1 = 8.15, EH = 3.0;
  const BX = .9, HW = 4, BZ0 = -7.5, BZ1 = 9.7, LG = 2, YB = 3.3, KW = 2.1, RP = 4;

  /* Masterplan */
  const plan = unit('plan', 1, 5.1, .06);
  const zones = [0, 1, 2].map(i => grp(plan, 'zone' + i));
  box(zones[0], EX0, .02, EZ0, EX1, .1, EZ1, M(zones[0], C.gelb, { r: .8 })); box(zones[0], -9.6, .02, EZ1, -1.1, .08, 12.4, M(zones[0], C.gelb, { r: .8 }));
  const zw0 = LM(zones[0], C.kalk, .55); wire(zones[0], EX0, .1, EZ0, EX1, EH, EZ1, zw0); wire(zones[0], BX - HW, YB, BZ0, BX + HW, YB + KW + RP, BZ1, zw0);
  box(zones[1], -15.3, .02, 1.4, -10.3, .07, 7.6, M(zones[1], C.kalk, { op: .35 }), LM(zones[1], 0xFFFFFF, .9));
  wire(zones[1], -15.3, .07, 1.4, -10.3, 2.8, 7.6, LM(zones[1], C.kalk, .5, true));
  box(zones[2], 8.1, .02, -7.9, 14.9, .07, 6.9, M(zones[2], C.kalk, { op: .2 }), LM(zones[2], 0xFFFFFF, .9));
  wire(zones[2], 8.5, -1.3, -7.5, 14.5, .07, -1.5, LM(zones[2], C.kalk, .45, true)); wire(zones[2], 9.6, .07, 3.6, 12.6, 2.6, 6.6, LM(zones[2], C.kalk, .45, true));
  anchor(plan, 'z0', -1.1, .2, 12.4); anchor(plan, 'z1', -10.3, .3, 7.6); anchor(plan, 'z2', 14.9, .3, -.5);
  anchor(plan, 'lay-plan', 17, -1.5, 6);

  /* Fundament */
  const fund = unit('fund', 2, 6.4, .1);
  const bm = M(fund, C.beton, { r: .95 }), be = LM(fund, C.schwarz, .35);
  box(fund, EX0 - .3, -.8, EZ0 - .3, EX1 + .3, .02, EZ1 + .3, bm, be);
  [[EX0 - .3, EZ0 - .3, EX1 + .3, EZ0 + .2], [EX0 - .3, EZ1 - .2, EX1 + .3, EZ1 + .3], [EX0 - .3, EZ0 + .2, EX0 + .2, EZ1 - .2], [EX1 - .2, EZ0 + .2, EX1 + .3, EZ1 - .2]].forEach(([a, b, c, d]) => box(fund, a, -1.45, b, c, -.8, d, bm, be));
  anchor(fund, 'slab', EX1 + .3, -.4, EZ1 + .3); anchor(fund, 'lay-fund', 17, 1.2, 6);

  /* Bausystem */
  const hul = unit('huelle', 3, 7.1, 0);
  const stoneTex = rep => tex((x, w, h) => { x.fillStyle = '#3f3a35'; x.fillRect(0, 0, w, h); let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280; const cols = ['#6f665d', '#857a6e', '#5f5852', '#978b7d', '#7a7066', '#8c8174', '#675f57']; let y = 0; while (y < h) { const ch = 12 + rnd() * 14; let xx = -rnd() * 40; while (xx < w) { const cw = 22 + rnd() * 52; x.fillStyle = cols[Math.floor(rnd() * cols.length)]; x.fillRect(xx + 1.5, y + 1.5, cw - 3, ch - 3); xx += cw; } y += ch; } }, 512, 512, rep);
  const stoneL = M(hul, 0xffffff, { map: stoneTex([5, 1]), r: .95 }), stoneS = M(hul, 0xffffff, { map: stoneTex([4.4, 1]), r: .95 });
  const stoneFL = M(hul, 0xffffff, { map: stoneTex([2.24, 1]), r: .95 }), stoneFR = M(hul, 0xffffff, { map: stoneTex([2.37, 1]), r: .95 }), stoneFT = M(hul, 0xffffff, { map: stoneTex([.39, .2]), r: .95 });
  const we = LM(hul, C.schwarz, .28), fr = LM(hul, 0x141414, .95), larch = M(hul, 0xB39878, { r: .85 }), reveal = M(hul, 0xC9AA82, { r: .8 }), cap = M(hul, 0x3a3835, { r: .9 }), dark = M(hul, 0x2b2a29, { r: .7 });
  const glas = M(hul, 0x56636e, { r: .05, m: .9, em: 0xFFE3BF, ei: 0 }), alu = M(hul, 0x2a2c2e, { r: .45, m: .5 }), rail = M(hul, 0xDDE3E3, { op: .25, r: .1 });
  const gvol = grp(hul, 'gvol');
  const bx = (g, a, b, c, d, e, f, m) => box(g, Math.min(a, d), Math.min(b, e), Math.min(c, f), Math.max(a, d), Math.max(b, e), Math.max(c, f), m);
  const FW = .075, FD = .07;
  const winZ = (g, x0, x1, y0, y1, z, o, div = []) => { const zp = z + o * .006; bx(g, x0, y0, zp, x1, y1, zp + o * .02, glas); const zf = z, zf2 = z + o * FD;
    bx(g, x0 - FW, y0 - FW, zf, x1 + FW, y0, zf2, alu); bx(g, x0 - FW, y1, zf, x1 + FW, y1 + FW, zf2, alu); bx(g, x0 - FW, y0, zf, x0, y1, zf2, alu); bx(g, x1, y0, zf, x1 + FW, y1, zf2, alu);
    div.forEach(f => { const x = x0 + (x1 - x0) * f; bx(g, x - FW / 2, y0, zf, x + FW / 2, y1, zf2 - o * .015, alu); }); };
  const winX = (g, z0, z1, y0, y1, x, o, div = []) => { const xp = x + o * .006; bx(g, xp, y0, z0, xp + o * .02, y1, z1, glas); const xf = x, xf2 = x + o * FD;
    bx(g, xf, y0 - FW, z0 - FW, xf2, y0, z1 + FW, alu); bx(g, xf, y1, z0 - FW, xf2, y1 + FW, z1 + FW, alu); bx(g, xf, y0, z0 - FW, xf2, y1, z0, alu); bx(g, xf, y0, z1, xf2, y1, z1 + FW, alu);
    div.forEach(f => { const z = z0 + (z1 - z0) * f; bx(g, xf, y0, z - FW / 2, xf2 - o * .015, y1, z + FW / 2, alu); }); };
  { const SW = 3.08, SH = 3, stW = M(hul, 0xffffff, { map: stoneTex([1, 1]), r: .95 }), pl = M(hul, 0xF3F1EC, { r: .92 });
    const wbox = (x0, y0, z0, x1, y1, z1, mats) => { const g = new T.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), uv = g.attributes.uv, D = [[z1 - z0, y1 - y0, z0], [z1 - z0, y1 - y0, z0], [x1 - x0, z1 - z0, x0], [x1 - x0, z1 - z0, x0], [x1 - x0, y1 - y0, x0], [x1 - x0, y1 - y0, x0]];
      for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k, [w, h, o] = D[f]; uv.setXY(i, uv.getX(i) * w / SW + o / SW, uv.getY(i) * h / SH + y0 / SH); }
      const m = new T.Mesh(g, mats); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); m.castShadow = m.receiveShadow = true; m.add(new T.LineSegments(new T.EdgesGeometry(g), we)); gvol.add(m); };
    const wall = (axis, u0, u1, c0, c1, holes, mats) => { let u = u0; const seg = (a, b, y0, y1) => { if (b - a < .01 || y1 - y0 < .01) return; if (axis === 'x') wbox(a, y0, c0, b, y1, c1, mats); else wbox(c0, y0, a, c1, y1, b, mats); };
      holes.slice().sort((p, q) => p[0] - q[0]).forEach(([a, b, y0, y1]) => { seg(u, a, 0, EH); seg(a, b, 0, y0); seg(a, b, y1, EH); u = b; }); seg(u, u1, 0, EH); };
    wall('x', EX0, EX1, EZ1 - .3, EZ1, [[-2.6, -1.4, 0, 2.4], [-.95, -.35, .15, 2.4], [3.4, 5.4, .15, 2.8]], [stW, stW, cap, cap, stW, pl]);
    wall('x', EX0, EX1, EZ0, EZ0 + .3, [[-8.6, -6.2, .9, 2.3], [-1.6, 4.6, .15, 2.8]], [stW, stW, cap, cap, pl, stW]);
    wall('z', EZ0 + .3, EZ1 - .3, EX0, EX0 + .3, [[-4.8, -3.6, .9, 2.2]], [pl, stW, cap, cap, stW, stW]);
    wall('z', EZ0 + .3, EZ1 - .3, EX1 - .3, EX1, [[-4.6, -1.8, .15, 2.8], [4.6, 7.3, .15, 2.8]], [stW, pl, cap, cap, stW, stW]);
    const P6 = [pl, pl, cap, cap, pl, pl]; wbox(-3.25, 0, EZ0 + .3, -2.95, EH, EZ1 - .3, P6); wbox(EX0 + .3, 0, 1.5, -3.25, EH, 1.8, P6); }
  winZ(gvol, -1.6, 4.6, .15, 2.8, EZ0, -1, [.25, .5, .75]); winZ(gvol, -8.6, -6.2, .9, 2.3, EZ0, -1, [.5]); winZ(gvol, 3.4, 5.4, .15, 2.8, EZ1, 1, [.5]); winZ(gvol, -.95, -.35, .15, 2.4, EZ1, 1);
  winX(gvol, -4.6, -1.8, .15, 2.8, EX1, 1, [.5]); winX(gvol, 4.6, 7.3, .15, 2.8, EX1, 1, [.5]); winX(gvol, -4.8, -3.6, .9, 2.2, EX0, -1);
  const hdoor = new T.Group(); hdoor.position.set(-2.6, 0, EZ1 + .02); gvol.add(hdoor); box(hdoor, 0, .02, -.03, 1.2, 2.4, .03, alu);
  box(gvol, -8.9, .02, EZ1 - .01, -3.75, 2.45, EZ1 + .05, alu);
  segs(gvol, [.5, .9, 1.3, 1.7, 2.1].map(y => [-8.9, y, EZ1 + .075, -3.75, y, EZ1 + .075]), LM(gvol, 0x000000, .6));
  const deck = grp(hul, 'deck'); box(deck, EX0 - .1, EH, EZ0 - .1, EX1 + .1, YB, EZ1 + .1, cap, we);
  const pent = (w, b0, k, apex) => { const sh = new T.Shape(); sh.moveTo(-w, b0); sh.lineTo(w, b0); sh.lineTo(w, k); sh.lineTo(0, apex); sh.lineTo(-w, k); sh.closePath(); return sh; };
  const ext = (sh, len) => new T.ExtrudeGeometry(sh, { depth: len, bevelEnabled: false });
  const mesh = (g, m, p, edges) => { const o = new T.Mesh(g, m); o.position.set(...p); o.castShadow = o.receiveShadow = true; if (edges) o.add(new T.LineSegments(new T.EdgesGeometry(g, 20), edges)); return o; };
  const up = grp(hul, 'up');
  const CZ0 = BZ0 + LG, CZ1 = BZ1 - LG;
  up.add(mesh(ext(pent(HW, 0, KW, KW + RP), CZ1 - CZ0), larch, [BX, YB, CZ0], we));
  const hs = [3.6, .4, KW - .05, KW + RP - .55];
  const ring = () => { const r = pent(HW, 0, KW, KW + RP), h = new T.Path(); h.moveTo(-hs[0], hs[1]); h.lineTo(hs[0], hs[1]); h.lineTo(hs[0], hs[2]); h.lineTo(0, hs[3]); h.lineTo(-hs[0], hs[2]); h.closePath(); r.holes.push(h); return r; };
  [BZ0, CZ1].forEach(z => up.add(mesh(ext(ring(), LG), [reveal, larch].length && larch, [BX, YB, z], we)));
  [CZ0 - .03, CZ1 - .02].forEach(z => up.add(mesh(ext(pent(hs[0], hs[1], hs[2], hs[3]), .05), glas, [BX, YB, z])));
  [[CZ0 - .03, -1], [CZ1 + .03, 1]].forEach(([z, o]) => { const z2 = z + o * .07;
    bx(up, BX - .045, YB + hs[1], z, BX + .045, YB + hs[3] - .05, z2, alu);
    [-1.8, 1.8].forEach(dx => bx(up, BX + dx - .04, YB + hs[1], z, BX + dx + .04, YB + hs[2] + 2 * (hs[0] - Math.abs(dx)) / hs[0] * (hs[3] - hs[2]) / 2 - .05, z2, alu));
    bx(up, BX - hs[0], YB + 2.4, z, BX + hs[0], YB + 2.48, z2, alu); bx(up, BX - hs[0], YB + hs[1], z, BX + hs[0], YB + hs[1] + .08, z2, alu);
    [-1, 1].forEach(sg => { const L = Math.hypot(hs[0], hs[3] - hs[2]), m = new T.Mesh(new T.BoxGeometry(L, .08, .07), alu); m.position.set(BX + sg * hs[0] / 2, YB + (hs[2] + hs[3]) / 2, z + o * .035); m.rotation.z = -sg * Math.atan2(hs[3] - hs[2], hs[0]); up.add(m); });
    [-hs[0], hs[0] - .08].forEach(dx => bx(up, BX + dx, YB + hs[1], z, BX + dx + .08, YB + hs[2], z2, alu)); });
  [BZ0 + .12, BZ1 - .16].forEach(z => box(up, BX - hs[0], YB + hs[1], z, BX + hs[0], YB + hs[1] + 1.05, z + .04, rail, LM(hul, 0x141414, .8)));
  [[BX - HW, -1, [-1.5, -.5, 4.2]], [BX + HW, 1, [-3.6, -2.6, 2.2, 3.2]]].forEach(([x, o, zs]) => zs.forEach(z => winX(up, z, z + .42, YB + .35, YB + 1.85, x + o * .012, o)));
  { const cl = [], lc = LM(hul, 0x3b2f24, .3);
    for (let z = BZ0 + .08; z < BZ1; z += .16) cl.push([BX - HW - .012, YB, z, BX - HW - .012, YB + KW, z], [BX + HW + .012, YB, z, BX + HW + .012, YB + KW, z]);
    segs(up, cl, lc); }
  const roof = grp(hul, 'roof'), roofIns = grp(hul, 'roofIns');
  { const ang = Math.atan2(RP, HW), ov = .3, L = (HW + ov) / Math.cos(ang), len = BZ1 - BZ0 + .4, cz = (BZ0 + BZ1) / 2, rm = M(hul, 0x242424, { r: .55, m: .25 }), re = LM(hul, C.kalk, .22); hul.userData.roofMat = rm; const _x = 0, im = M(roofIns, 0xD8D1C3, { r: 1 }), ie = LM(roofIns, C.schwarz, .3), n = .08;
    [1, -1].forEach(sg => {
      const g = new T.BoxGeometry(L, .16, len), m = new T.Mesh(g, rm); m.rotation.z = -sg * ang;
      m.position.set(BX + sg * (HW + ov) / 2 + sg * n * Math.sin(ang), YB + KW + RP - (HW + ov) / 2 * Math.tan(ang) + n * Math.cos(ang), cz); m.castShadow = m.receiveShadow = true; m.add(new T.LineSegments(new T.EdgesGeometry(g), re)); roof.add(m);
      const L2 = HW / Math.cos(ang) - .4, g2 = new T.BoxGeometry(L2, .34, len - 4.6), m2 = new T.Mesh(g2, im); m2.rotation.z = -sg * ang;
      m2.position.set(BX + sg * HW / 2, YB + KW + RP - HW / 2 * Math.tan(ang) - .25, cz); m2.add(new T.LineSegments(new T.EdgesGeometry(g2), ie)); roofIns.add(m2);
    });
    box(roof, BX - .1, YB + KW + RP + .02, BZ0 - .2, BX + .1, YB + KW + RP + .2, BZ1 + .2, rm);
    const pvA = grp(roof, 'pvA'); pvA.rotation.z = -ang; pvA.position.set(BX + (HW + ov) / 2 + n * Math.sin(ang), YB + KW + RP - (HW + ov) / 2 * Math.tan(ang) + n * Math.cos(ang), cz);
    const pg = new T.BoxGeometry(1.72, .05, 1.06), panels = [];
    [-1.85, 0, 1.85].forEach(px => { for (let j = 0; j < 8; j++) { const mt = new T.MeshStandardMaterial({ color: 0x0e1620, roughness: .25, metalness: .6, emissive: 0x7f93ad, emissiveIntensity: 0, transparent: true, opacity: 0 });
      const m = new T.Mesh(pg, mt); m.position.set(px, .12, (j - 3.5) * 1.12); m.userData.y0 = .12; m.castShadow = true; m.add(new T.LineSegments(new T.EdgesGeometry(pg), LM(pvA, C.kalk, .35))); pvA.add(m); panels.push(m); } });
    pvA.userData.panels = panels; anchor(pvA, 'pvA', -1.85, .4, 0);
  }
  anchor(roof, 'dach', BX, YB + KW + RP + .3, BZ1 + .2); anchor(up, 'fassade', BX + HW + .05, YB + 2, -6.8); anchor(roofIns, 'daemm', BX + HW * .6, YB + KW + 1.2, CZ0 + 1);
  const dim = grp(hul, 'dim');
  segs(dim, [[EX1 + .45, .25, EZ1 + .3, EX1 + .45, 2.97, EZ1 + .3], [EX1 + .15, .25, EZ1 + .3, EX1 + .75, .25, EZ1 + .3], [EX1 + .15, 2.97, EZ1 + .3, EX1 + .75, 2.97, EZ1 + .3]], LM(dim, 0xFFFFFF, 1));
  anchor(gvol, 'fenster', BX - 1.8, YB + 3.4, CZ1 + .1); anchor(gvol, 'fensterI', 1.5, 2.2, EZ0 + .35); anchor(gvol, 'garage', -6.3, 2.7, EZ1 + .1); anchor(deck, 'decke', EX1 + .1, 3.6, EZ1 + .1); anchor(dim, 'hoehe', EX1 + .6, .2, EZ1 + .3);

  /* Hausplanung: das Haus als Zeichnung des Architekturteams */
  const zeich = grp(root, 'zeich'), zl = LM(zeich, 0xFFFFFF, .95), zf = LM(zeich, 0xFFFFFF, .5), zy = LM(zeich, C.gelb, 1);
  loop(zeich, [[EX0, .04, EZ0], [EX1, .04, EZ0], [EX1, .04, EZ1], [EX0, .04, EZ1]], zl);
  loop(zeich, [[EX0 + .3, .04, EZ0 + .3], [EX1 - .3, .04, EZ0 + .3], [EX1 - .3, .04, EZ1 - .3], [EX0 + .3, .04, EZ1 - .3]], zl);
  const zInt = segs(zeich, [[-3.1, .04, EZ0 + .3, -3.1, .04, EZ1 - .3], [EX0 + .3, .04, 1.65, -3.25, .04, 1.65], [EX0 + .3, .04, -1.78, -3.25, .04, -1.78], [.95, .04, 2.4, EX1 - .3, .04, 2.4], [1.02, .04, 2.4, 1.02, .04, EZ1 - .3]], zf);
  let zArc;
  { const arc = (cx, cz, a0, r = 1) => { const p = []; for (let i = 0; i <= 12; i++) { const a = (a0 + i / 12 * 90) * Math.PI / 180; p.push([cx + Math.cos(a) * r, .04, cz + Math.sin(a) * r]); } const o = []; for (let i = 0; i < 12; i++) o.push([...p[i], ...p[i + 1]]); o.push([cx, .04, cz, p[0][0], .04, p[0][2]]); return o; };
    zArc = segs(zeich, [...arc(-6.4, -1.78, -90), ...arc(-3.1, 3.2, 0), ...arc(1.02, 4.4, 0), ...arc(-2.6, EZ1 - .3, 180, 1.2)], zf); }
  segs(zeich, [[EX0, .04, EZ0 - 1.3, EX1, .04, EZ0 - 1.3], [EX0, .04, EZ0 - 1.6, EX0, .04, EZ0 - 1], [EX1, .04, EZ0 - 1.6, EX1, .04, EZ0 - 1], [-3.1, .04, EZ0 - 1.5, -3.1, .04, EZ0 - 1.1], [EX1 + 1.3, .04, EZ0, EX1 + 1.3, .04, EZ1], [EX1 + 1, .04, EZ0, EX1 + 1.6, .04, EZ0], [EX1 + 1, .04, EZ1, EX1 + 1.6, .04, EZ1], [EX1 + 1.1, .04, 2.4, EX1 + 1.5, .04, 2.4]], zl);
  segs(zeich, [[BX, -.2, BZ0 - 1.4, BX, -.2, BZ1 + 1.4]], zy);
  const zUp = grp(zeich, 'zUp');
  { const g1 = new T.BoxGeometry(EX1 - EX0, EH, EZ1 - EZ0); g1.translate((EX0 + EX1) / 2, EH / 2, (EZ0 + EZ1) / 2); zUp.add(new T.LineSegments(new T.EdgesGeometry(g1), zl));
    const g2 = ext(pent(HW, 0, KW, KW + RP), BZ1 - BZ0); g2.translate(BX, YB, BZ0); zUp.add(new T.LineSegments(new T.EdgesGeometry(g2), zl));
    const g3 = ext(pent(hs[0], hs[1], hs[2], hs[3]), .01); [BZ0 + LG, BZ1 - LG].forEach(z => { const l = new T.LineSegments(new T.EdgesGeometry(g3), zf); l.position.set(BX, YB, z); zUp.add(l); });
    const sp = []; for (let z = BZ0 + 1.2; z < BZ1; z += 1.2) sp.push([BX - HW, YB + KW, z, BX, YB + KW + RP, z], [BX, YB + KW + RP, z, BX + HW, YB + KW, z]); segs(zUp, sp, zf); }
  anchor(zUp, 'arch', BX, YB + KW + RP + .4, BZ1); anchor(zeich, 'einreich', EX1 + 1.3, .1, (EZ0 + EZ1) / 2); anchor(zUp, 'werk', EX1, EH, EZ1); anchor(zUp, 'statik', BX + HW, YB + KW, BZ0 + 2);

  /* Wandschnitt, Feuchte, übliche Raumhöhe */
  const WI = EZ1 - .3, wallx = grp(hul, 'wallx'), wxL = [];
  [[C.weiss, .05, 0], [C.sand, .14, 1], [0xC2A77F, .04, 0], [0xD8D1C3, .42, 2], [0xA48C6A, .05, 0], [0x887254, .1, 0], [0x75624B, .03, 0], [0x2a2a29, .07, 4], [0xB49E7F, .07, 5]].forEach(([col, th, ty], i) => {
    const g = new T.Group(); wallx.add(g); const m = M(wallx, col), e = LM(wallx, C.schwarz, .3), sd = M(wallx, C.sand);
    box(g, .4, .05, 0, 3, 2.95, th, m, e);
    if (ty === 1) [.5, 1.5, 2.5].forEach(y => box(g, .4, y, -.01, 3, y + .1, th + .01, sd));
    if (ty === 2) [.6, 1.5, 2.4].forEach(x => box(g, x, .05, -.01, x + .12, 2.95, th + .01, sd));
    if (ty === 4) [.5, 1.5, 2.45].forEach(x => box(g, x, .05, 0, x + .08, 2.95, th, sd));
    if (ty === 5) for (let x = .43; x < 2.95; x += .26) box(g, x, .05, 0, x + .2, 2.95, th + .02, M(wallx, 0xB49E7F));
    g.userData.th = th; g.position.z = WI; wxL.push(g);
  });
  const NP = 280, mp = new Float32Array(NP * 3), mph = [];
  for (let i = 0; i < NP; i++) mph.push([.5 + Math.random() * 2.4, .25 + Math.random() * 2.6, Math.random() * Math.PI * 2, .55 + Math.random() * .7]);
  const mg = new T.BufferGeometry(); mg.setAttribute('position', new T.BufferAttribute(mp, 3));
  const moist = new T.Points(mg, new T.PointsMaterial({ color: 0xFFFFFF, size: .13, transparent: true, opacity: 0, depthWrite: false, depthTest: false })); moist.renderOrder = 5; moist.frustumCulled = false; hul.add(moist);
  const ghostH = grp(hul, 'ghostH');
  { const pl = new T.Mesh(new T.PlaneGeometry(EX1 - EX0, EZ1 - EZ0), BM(ghostH, C.kalk, .16)); pl.rotation.x = -Math.PI / 2; pl.position.set((EX0 + EX1) / 2, 0, (EZ0 + EZ1) / 2); ghostH.add(pl);
    loop(ghostH, [[EX0, 0, EZ0], [EX1, 0, EZ0], [EX1, 0, EZ1], [EX0, 0, EZ1]], LM(ghostH, 0xFFFFFF, .9, true)); }
  anchor(wxL[8], 'wallx', 3, 2.95, .07); anchor(wxL[3], 'moist', 3, .35, .42); anchor(ghostH, 'ueblich', EX1, 0, EZ0);
  anchor(hul, 'lay-huelle', 17, 3.2, 6);

  /* Innen: Wohnen, Kochen, Essen, Bad, Arbeiten (nach Grundriss EG) */
  const inn = unit('innen', 4, 8.15, .14);
  const parkett = tex((x, w, h) => { x.fillStyle = '#C9B79E'; x.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#C2AF95' : '#CDBCA4'; x.fillRect(0, i * 32, w, 32); x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(0, i * 32, w, 1); const o = (i * 137) % 512; x.fillRect(o, i * 32, 1, 32); } }, 512, 512, [5, 7]);
  const fliese = tex((x, w, h) => { x.fillStyle = '#D9D7D2'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(0,0,0,.2)'; x.fillRect(0, 0, w, 2); x.fillRect(0, 0, 2, h); }, 256, 256, [4, 3]);
  const im = M(inn, C.weiss), ie = LM(inn, C.schwarz, .25), soft = M(inn, C.sand), car = M(inn, 0x3a3937, { r: .5 });
  box(inn, -2.95, 0, EZ0 + .3, EX1 - .3, .05, EZ1 - .3, M(inn, 0xFFFFFF, { map: parkett, r: .7 }));
  box(inn, EX0 + .3, 0, EZ0 + .3, -3.25, .07, -1.7, M(inn, 0xFFFFFF, { map: fliese, r: .4 }));
  box(inn, EX0 + .3, 0, -1.85, -6.4, 2.95, -1.7, im, ie); box(inn, -5.2, 0, -1.85, -3.25, 2.95, -1.7, im, ie);
  box(inn, .95, 0, 2.35, EX1 - .3, 2.95, 2.5, im, ie); box(inn, .95, 0, 2.5, 1.1, 2.95, EZ1 - .3, im, ie);
  const door = new T.Group(); door.position.set(-6.4, 0, -1.78); door.rotation.y = .95; inn.add(door); box(door, 0, .05, -.03, 1.15, 2.15, .03, im, ie);
  { const p = []; for (let i = 0; i <= 18; i++) { const a = -i / 18 * Math.PI / 2; p.push([-6.4 + Math.cos(a) * 1.2, .09, -1.78 + Math.sin(a) * 1.2]); } const sg = []; for (let i = 0; i < p.length - 1; i++) sg.push([...p[i], ...p[i + 1]]); segs(inn, sg, LM(inn, C.schwarz, .6)); }
  box(inn, -9, .07, -5, -7.3, .62, -4.1, im, ie); box(inn, -6.4, .8, -5.15, -4.8, .95, -4.6, im, ie);
  box(inn, -.6, .05, -4.65, .2, .45, -1.7, soft, ie); box(inn, .2, .05, -4.65, 1, .45, -3.9, soft, ie);
  box(inn, 2.6, .72, -4, 4.05, .78, -2.1, im, ie);
  box(inn, 2.1, .05, -.6, 5.45, .95, .4, im, ie); box(inn, 1.1, .05, 1.75, EX1 - .3, .95, 2.35, im, ie);
  { const tr = M(inn, 0xB08A62, { r: .55 }), sb = M(inn, 0x1b1b1a, { r: .5, m: .3 }); for (let i = 0; i < 11; i++) { const y = .05 + (i + 1) * .268; box(inn, -2.95, y - .06, -.4 + i * .245, -1.95, y, -.4 + (i + 1) * .245 + .03, tr, ie); } }
  box(inn, 1.6, .72, 6.4, 3.6, .78, 7.2, im, ie); box(inn, 2.6, .05, 4.2, 4.8, .45, 5, soft, ie);
  [[-8.4, -6.85], [-5.8, -4.25]].forEach(([a, b]) => box(inn, a, .05, 2.6, b, 1.45, 7.2, car, ie));
  const lamps = [[1.6, 2.5, -2.6], [-6.8, 2.5, -3.6]].map(p => { const l = new T.PointLight(0xFFE2BC, 0, 18, 1.2); l.position.set(...p); inn.add(l); return l; });
  inn.userData.old = inn.children.filter(c => { if (!c.isMesh || !c.geometry) return false; c.geometry.computeBoundingBox(); const b = c.geometry.boundingBox, h = (b.max.y - b.min.y) * c.scale.y; return h > .12 && h < 1.6; }).concat(inn.children.filter(c => c.isGroup));
  const IA = { floor: new T.Group(), ein: new T.Group(), moe: new T.Group(), dek: new T.Group() }; Object.values(IA).forEach(g => inn.add(g)); inn.userData.IA = IA;
  { const oak = M(inn, 0xB08A62, { r: .55 }), oakD = M(inn, 0x8C6A48, { r: .6 }), blk = M(inn, 0x1b1b1a, { r: .55, m: .2 }), brass = M(inn, 0xB59A6A, { r: .3, m: .8 }), lin = M(inn, 0xE7E1D6, { r: .95 }), boucle = M(inn, 0xF0ECE4, { r: 1 }), sal = M(inn, 0x8B907C, { r: .9 }), cog = M(inn, 0x8A5A3B, { r: .5 }), terr = M(inn, 0xA0714F, { r: .8 }), trav = M(inn, 0xD9CFBF, { r: .45 }), rugM = M(inn, 0xD9D0C1, { r: 1 }), rug2 = M(inn, 0xB9B2A4, { r: 1 }), lampM = M(inn, 0xFFF1DC, { r: .4, em: 0xFFE2BC, ei: .9 }), mir = M(inn, 0xC9CED2, { r: .05, m: .9 }), gls = M(inn, 0x9fb3bd, { r: .05, m: .2, op: .35 }), wht = M(inn, 0xF3F1EC, { r: .4 });
    const herr = M(inn, 0xffffff, { r: .6, map: tex((x, w, h) => { x.fillStyle = '#A9845C'; x.fillRect(0, 0, w, h); let sd = 4; const rn = () => (sd = (sd * 16807) % 2147483647) / 2147483647; const L = 64, W = 16;
      for (let j = -2; j < h / W + 4; j++) for (let i = -2; i < w / L + 4; i++) [0, 1].forEach(k => { x.save(); x.translate(i * L + (k ? L / 2 : 0), j * W * 2 + (k ? W : 0)); x.rotate(k ? -Math.PI / 4 : Math.PI / 4); const t = 150 + Math.floor(rn() * 40); x.fillStyle = 'rgb(' + t + ',' + Math.floor(t * .78) + ',' + Math.floor(t * .55) + ')'; x.fillRect(0, 0, L * .7, W * .92); x.restore(); }); }, 512, 512, [1.7, 1.7]) });
    const tile = M(inn, 0xffffff, { r: .3, map: tex((x, w, h) => { x.fillStyle = '#CFCAC1'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(0,0,0,.16)'; x.fillRect(0, 0, w, 2); x.fillRect(0, 0, 2, h); x.fillRect(0, h / 2, w, 1); }, 256, 256, [2, 2]) });
    const F = IA.floor, E = IA.ein, Mo = IA.moe, D = IA.dek;
    const add = (geo, m, x, y, z, par) => { const o = new T.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; par.add(o); return o; };
    const cyl = (par, x, y, z, r, h, m, r2, seg = 28) => add(new T.CylinderGeometry(r2 ?? r, r, h, seg), m, x, y + h / 2, z, par);
    const sph = (par, x, y, z, r, m) => add(new T.SphereGeometry(r, 18, 12), m, x, y, z, par);
    const chair = (x, z, ry) => { const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ry; Mo.add(g); add(new T.BoxGeometry(.46, .05, .46), oak, 0, .46, 0, g); add(new T.BoxGeometry(.46, .36, .04), oak, 0, .7, -.21, g); [[-.2, -.2], [.2, -.2], [-.2, .2], [.2, .2]].forEach(([a, b]) => add(new T.BoxGeometry(.025, .46, .025), blk, a, .23, b, g)); };
    const pend = (par, x, z, y = 1.55, big = 1) => { cyl(par, x, y + .2, z, .006, 2.9 - y - .2, blk, .006, 6); cyl(par, x, y, z, .24 * big, .2, lampM, .06 * big); };
    box(F, -2.95, .052, EZ0 + .3, EX1 - .3, .064, 2.35, herr); box(F, -2.95, .052, 2.5, EX1 - .3, .064, EZ1 - .3, herr);
    box(F, EX0 + .3, .072, EZ0 + .3, -3.25, .084, -1.7, tile); box(F, EX0 + .3, .084, EZ0 + .3, -3.3, 2.4, EZ0 + .34, tile);
    box(E, 4.1, .05, 1.78, EX1 - .32, 2.45, 2.33, oak); box(E, 4.5, 1.0, 1.76, 5.2, 1.6, 1.78, blk);
    box(E, 1.12, .05, 1.78, 4.08, .92, 2.33, blk); box(E, 1.1, .92, 1.74, 4.1, .98, 2.35, trav); box(E, 1.12, 1.4, 2.25, 4.08, 2.2, 2.33, oak);
    box(E, 2.08, .05, -.62, 5.47, .9, .42, blk); box(E, 2.0, .9, -.7, 5.56, .97, .5, trav); box(E, 5.49, .05, -.7, 5.56, .9, .5, trav);
    box(E, 5.2, .05, 3.0, 5.56, 2.3, 3.05, oak); box(E, 5.2, .05, 7.35, 5.56, 2.3, 7.4, oak); [.05, .62, 1.19, 1.76, 2.26].forEach(y => box(E, 5.2, y, 3.0, 5.56, y + .04, 7.4, oak));
    box(E, -3.72, .05, 4.3, -3.15, 2.5, 7.7, oak); [5.15, 6.0, 6.85].forEach(z => box(E, -3.16, .1, z - .008, -3.14, 2.45, z + .008, blk)); [4.7, 5.55, 6.4, 7.25].forEach(z => box(E, -3.15, 1.0, z - .02, -3.12, 1.5, z + .02, brass));
    box(E, -6.4, .35, -5.15, -4.8, .8, -4.62, oak); box(E, -6.42, .8, -5.17, -4.78, .84, -4.6, trav); box(E, -4.22, .08, -5.2, -4.2, 2.1, -3.8, gls); box(E, -2.9, .05, -5.16, -1.3, .48, -4.78, oakD);
    box(Mo, -2.88, .05, -4.6, -1.98, .42, -1.8, boucle); box(Mo, -2.88, .42, -4.6, -2.62, .84, -1.8, boucle); box(Mo, -1.98, .05, -4.6, -1.13, .42, -3.82, boucle); box(Mo, -2.88, .42, -4.6, -1.13, .84, -4.36, boucle);
    box(Mo, -2.61, .42, -2.62, -2.44, .74, -2.08, sal); box(Mo, -2.61, .42, -3.5, -2.44, .74, -2.96, lin); box(Mo, -1.9, .42, -4.35, -1.36, .74, -4.18, sal);
    cyl(Mo, -1.1, .05, -2.75, .52, .34, trav, .52, 48); cyl(Mo, -.45, .05, -2.1, .3, .26, oakD, .3, 36);
    box(Mo, .1, .05, -3.2, .85, .4, -2.4, cog); box(Mo, .67, .4, -3.2, .85, .9, -2.4, cog);
    box(Mo, 2.5, .76, -4.1, 4.15, .8, -2.0, oak); [[2.6, -4.0], [4.05, -4.0], [2.6, -2.1], [4.05, -2.1]].forEach(([x, z]) => box(Mo, x - .025, .05, z - .025, x + .025, .76, z + .025, blk));
    [[2.2, -3.5, Math.PI / 2], [2.2, -2.6, Math.PI / 2], [4.45, -3.5, -Math.PI / 2], [4.45, -2.6, -Math.PI / 2], [3.33, -4.4, 0], [3.33, -1.7, Math.PI]].forEach(([x, z, r]) => chair(x, z, r));
    [2.9, 3.7, 4.5].forEach(x => { cyl(Mo, x, .05, -1.05, .018, .66, blk); cyl(Mo, x, .7, -1.05, .2, .05, oak); });
    box(Mo, 1.55, .76, 6.35, 3.65, .8, 7.25, oak); box(Mo, 1.6, .05, 7.15, 1.64, .76, 7.2, blk); box(Mo, 3.56, .05, 7.15, 3.6, .76, 7.2, blk); cyl(Mo, 2.6, .05, 5.9, .26, .04, blk); cyl(Mo, 2.6, .09, 5.9, .03, .38, blk); box(Mo, 2.36, .47, 5.66, 2.84, .53, 6.14, blk); box(Mo, 2.36, .53, 6.08, 2.84, .95, 6.14, blk);
    box(Mo, 2.65, .05, 4.2, 4.8, .44, 5.0, lin); box(Mo, 2.65, .44, 4.82, 4.8, .78, 5.0, lin); box(Mo, 4.15, .05, 4.25, 4.75, .4, 4.85, sal);
    box(D, -2.75, .064, -4.5, .95, .072, -1.65, rugM); box(D, 1.6, .064, 3.2, 4.95, .072, 5.7, rug2);
    cyl(D, -2.55, .05, -4.95, .24, .52, terr, .2); sph(D, -2.55, 1.02, -4.95, .42, sal); sph(D, -2.4, 1.42, -4.88, .28, sal); cyl(D, -8.9, .07, -2.3, .18, .38, terr, .15); sph(D, -8.9, .66, -2.3, .27, sal);
    cyl(D, -2.6, .05, -1.5, .2, .03, blk); cyl(D, -2.6, .08, -1.5, .015, 1.85, brass); box(D, -2.6, 1.9, -1.52, -1.6, 1.93, -1.48, brass); cyl(D, -1.6, 1.64, -1.5, .2, .26, lampM, .05);
    pend(D, 3.0, -3.05); pend(D, 3.65, -3.05); [2.9, 3.7, 4.5].forEach(x => pend(D, x, -.1, 1.75, .5));
    box(D, -2.95, 1.25, -4.1, -2.92, 2.15, -2.3, blk); box(D, -2.92, 1.32, -4.03, -2.91, 2.08, -2.37, M(inn, 0x887254, { r: .9 })); box(D, 2.0, 1.15, 2.5, 3.4, 2.1, 2.53, blk); box(D, 2.08, 1.23, 2.53, 3.32, 2.02, 2.54, M(inn, 0xCFC3B3, { r: .9 }));
    { const m = add(new T.CylinderGeometry(.42, .42, .02, 40), mir, -5.6, 1.7, -5.17, D); m.rotation.x = Math.PI / 2; } cyl(D, -5.6, .84, -4.88, .2, .12, wht, .16);
    cyl(D, 3.33, .8, -3.05, .12, .2, wht, .09); { let sd = 9; const rn = () => (sd = (sd * 16807) % 2147483647) / 2147483647, cols = [lin, sal, cog, blk, rugM, terr]; [.09, .66, 1.23].forEach(y => { let z = 3.1; while (z < 7.2) { const w = .05 + rn() * .07, h = .3 + rn() * .2; box(D, 5.25, y, z, 5.5, y + h, z + w, cols[Math.floor(rn() * cols.length)]); z += w + (rn() < .2 ? .35 : .01); } }); }
    anchor(F, 'iaBoden', 5.4, .1, -4.6); anchor(E, 'iaEinbau', 5.5, 2.45, 2.3); anchor(Mo, 'iaMoebel', 4.2, .8, -2.1); anchor(D, 'iaDeko', -1.6, 1.9, -1.5);
  }
  anchor(inn, 'parkett', 1.4, .1, -1.2); anchor(inn, 'open', 2.4, 1.8, 4.6); anchor(inn, 'fliesen', -3.6, .1, -4.4); anchor(inn, 'bad', -9.1, .7, -5.1); anchor(inn, 'tuer', -2.95, 2.9, 1.6);
  anchor(inn, 'lay-innen', 17, 3, 6);

  /* Rund ums Haus */
  const au = [];
  const ter = unit('terrasse', 5, 9.0, .18); au.push(ter);
  { const tm = M(ter, C.sand), tl = LM(ter, C.schwarz, .18); box(ter, EX0 - 1.6, 0, EZ0 - 4, EX1, .18, EZ0, tm, LM(ter, C.schwarz, .25)); box(ter, EX0 - 1.6, 0, EZ0, EX0, .18, 1.6, tm, LM(ter, C.schwarz, .25));
    const sg = []; for (let x = EX0 - 1.4; x < EX1; x += .5) sg.push([x, .185, EZ0 - 4, x, .185, EZ0]); segs(ter, sg, tl); }
  const zuf = unit('carport', 5, 9.12, .2); au.push(zuf);
  { const pv = M(zuf, 0x55534f, { r: .95 }), pe = LM(zuf, C.schwarz, .25); box(zuf, -9.6, 0, EZ1, -3, .06, 12, pv, pe); box(zuf, -2.9, 0, EZ1, -1.1, .06, 12, pv, pe);
    [0, 1, 2].forEach(i => box(zuf, -3.1 + i * .02, .06 + i * .14, EZ1 + 1.6 - i * .45, -.8, .2 + i * .14, EZ1 + 2.05 - i * .45, M(zuf, 0x8d8a85))); }
  const pool = unit('pool', 5, 9.24, .22); au.push(pool);
  { const rm = M(pool, C.kalk), re = LM(pool, C.schwarz, .25); box(pool, 8.1, 0, -7.9, 14.9, .16, -7.5, rm, re); box(pool, 8.1, 0, -1.5, 14.9, .16, -1.1, rm, re); box(pool, 8.1, 0, -7.5, 8.5, .16, -1.5, rm, re); box(pool, 14.5, 0, -7.5, 14.9, .16, -1.5, rm, re); box(pool, 8.5, 0, -7.5, 14.5, .1, -1.5, M(pool, C.salbei, { r: .12, m: .2 })); }
  const sau = unit('sauna', 5, 9.36, .24); au.push(sau);
  box(sau, 9.6, 0, 3.6, 12.6, 2.6, 6.6, M(sau, 0xB39878), LM(sau, C.schwarz, .28)); box(sau, 9.59, .3, 4.4, 9.63, 2.2, 5.8, M(sau, 0x56636e, { r: .05, m: .9, glass: 1 })); box(sau, 9.57, .22, 4.32, 9.6, 2.28, 5.88, M(sau, 0x2a2c2e, { r: .45, m: .5 }));
  const gar = unit('garten', 5, 9.5, .26); au.push(gar);
  { const tm = M(gar, C.weiss), crm = M(gar, C.weiss), hm = M(gar, C.salbei); gar.userData.crown = crm; const trunk = new T.CylinderGeometry(.1, .12, 2.4, 8), crown = new T.SphereGeometry(1.45, 24, 16);
    [[-13.6, -10.2], [14, -10.4], [14.4, 10], [-13.8, 10.2], [7.4, 10.8], [-14, -3.6], [14.6, 2], [3.4, -10.8]].forEach(([x, z], i) => { const sc = .8 + (i % 3) * .16; const tr = new T.Mesh(trunk, tm); tr.position.set(x, 1.2 * sc, z); tr.scale.setScalar(sc); tr.castShadow = true; const cr = new T.Mesh(crown, crm); cr.position.set(x, 3.4 * sc, z); cr.scale.setScalar(sc); cr.castShadow = cr.receiveShadow = true; gar.add(tr, cr); });
    box(gar, -15.6, 0, -11.7, 15.6, 1.1, -11, hm); }
  anchor(ter, 'terrasse', 2, .3, EZ0 - 3.6); anchor(zuf, 'carport', -6.3, .2, 10.6); anchor(pool, 'pool', 11.5, .2, -4.5); anchor(sau, 'sauna', 12.6, 2.6, 6.6); anchor(gar, 'garten', 14, 4.4, -10.4);
  anchor(ter, 'lay-aussen', 17, 3.2, 6);

  /* Besser leben: Jahreszeiten, Kundendienst */
  const life = grp(root, 'life');
  { const sn = new T.Mesh(new T.PlaneGeometry(32, 24), BM(life, 0xF4F4F2, .9)); sn.rotation.x = -Math.PI / 2; sn.position.y = .03; life.add(sn); life.userData.snowPlane = sn;
    const NS = 900, sp = new Float32Array(NS * 3), sd = []; for (let i = 0; i < NS; i++) sd.push([-16 + Math.random() * 32, Math.random() * 22, -12 + Math.random() * 24, .6 + Math.random() * .8]);
    const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(sp, 3));
    const flakes = new T.Points(sg, new T.PointsMaterial({ color: 0xFFFFFF, size: .12, transparent: true, opacity: 0, depthWrite: false })); flakes.frustumCulled = false; life.add(flakes); life.userData.flakes = flakes; life.userData.sd = sd;
    /* GRIFFNER Transporter mit Handwerkern */
    const van = new T.Group(); life.add(van); life.userData.van = van;
    const vb = new T.MeshStandardMaterial({ color: 0x111111, roughness: .35, metalness: .4 }), vg = new T.MeshStandardMaterial({ color: 0x2a3138, roughness: .05, metalness: .9 }), vy = new T.MeshStandardMaterial({ color: C.gelb, roughness: .6 }), vt = new T.MeshStandardMaterial({ color: 0x1a1a1a, roughness: .9 }), vr = new T.MeshStandardMaterial({ color: 0x9a9a9a, roughness: .4, metalness: .6 });
    const vbox = (m, x0, y0, z0, x1, y1, z1) => { const o = new T.Mesh(new T.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m); o.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); o.castShadow = o.receiveShadow = true; van.add(o); return o; };
    vbox(vb, -1.05, .45, -2.9, 1.05, 2.65, 1.4); vbox(vb, -1.05, .45, 1.4, 1.05, 1.55, 2.6);
    { const hood = new T.Mesh(new T.BoxGeometry(2.1, .16, 1.6), vb); hood.position.set(0, 2.1, 1.85); hood.rotation.x = .62; hood.castShadow = true; van.add(hood); const ws = new T.Mesh(new T.BoxGeometry(1.9, .05, 1.45), vg); ws.position.set(0, 2.12, 1.93); ws.rotation.x = .62; van.add(ws); }
    vbox(vg, -1.07, 1.65, .5, -1.04, 2.3, 1.45); vbox(vg, 1.04, 1.65, .5, 1.07, 2.3, 1.45);
    vbox(vr, -1.08, .45, -2.95, 1.08, .62, 2.65); vbox(vy, -.9, .7, 2.6, -.6, .85, 2.64); vbox(vy, .6, .7, 2.6, .9, .85, 2.64);
    const wheels = []; [[-1.02, -1.9], [1.02, -1.9], [-1.02, 1.75], [1.02, 1.75]].forEach(([x, z]) => { const w = new T.Mesh(new T.CylinderGeometry(.42, .42, .3, 20), vt); w.rotation.z = Math.PI / 2; w.position.set(x, .42, z); w.castShadow = true; van.add(w); wheels.push(w); });
    life.userData.wheels = wheels;
    const sideDoor = new T.Mesh(new T.BoxGeometry(.05, 1.9, 1.3), vb); sideDoor.position.set(1.08, 1.5, .6); van.add(sideDoor); life.userData.sideDoor = sideDoor;
    { const vdec = (url, cw, ch, w, h, par, x, y, z, ry) => { const t = svgTex(url, cw, ch);
        
        const m = new T.MeshBasicMaterial({ map: t, transparent: true, alphaTest: .08 }); m.userData.base = 1; life.userData.mats.push(m); const p = new T.Mesh(new T.PlaneGeometry(w, h), m); p.position.set(x, y, z); p.rotation.y = ry; par.add(p); };
      [1, -1].forEach(sd => vdec(LOGO_INV, 1024, 1030, 1.2, 1.207, van, sd * 1.085, 1.72, -1.8, sd * Math.PI / 2));
      vdec(CLAIM_W, 2048, 330, 1.5, .242, van, -1.085, .95, .45, -Math.PI / 2);
      vdec(CLAIM_W, 2048, 330, 1.2, .194, sideDoor, .03, -.55, -.05, Math.PI / 2); }
    const crew = []; const wm2 = new T.MeshStandardMaterial({ color: 0xEAE8E3, roughness: .85 }), wd = new T.MeshStandardMaterial({ color: 0x2b2a29, roughness: .9 });
    [0, 1].forEach(i => { const g = new T.Group(); const legs = new T.Mesh(new T.CylinderGeometry(.17, .15, .85, 10), wd); legs.position.y = .43; const body = new T.Mesh(new T.CylinderGeometry(.23, .2, .75, 12), wd); body.position.y = 1.22; const head = new T.Mesh(new T.SphereGeometry(.17, 16, 12), wm2); head.position.y = 1.78; const cap = new T.Mesh(new T.CylinderGeometry(.18, .18, .07, 14), new T.MeshStandardMaterial({ color: C.gelb, roughness: .6 })); cap.position.y = 1.9; [legs, body, head, cap].forEach(m => { m.castShadow = true; g.add(m); }); if (i === 1) { const tb = new T.Mesh(new T.BoxGeometry(.5, .28, .22), new T.MeshStandardMaterial({ color: 0x55534f, roughness: .7 })); tb.position.set(.34, .75, 0); tb.castShadow = true; g.add(tb); } life.add(g); crew.push(g); });
    life.userData.crew = crew;
    const vanAnchor = new T.Object3D(); vanAnchor.position.set(0, 4.6, -1); van.add(vanAnchor); A.van = vanAnchor; }

  /* Projektmanager */
  const pm = grp(root, 'pm');
  const ym = M(pm, C.gelb, { r: .5, em: C.gelb, ei: .35 });
  const spineGeo = new T.CylinderGeometry(.09, .09, 1, 8); spineGeo.translate(0, .5, 0);
  const spine = new T.Mesh(spineGeo, ym); spine.position.set(BX, 0, 1.1); pm.add(spine);
  const curve = new T.CatmullRomCurve3([[-6.3, .25, 18], [-6.3, .3, 11.5], [-5.5, 1, 8.7], [-1.9, 1.2, 8.9], [.2, 2.4, 6], [.9, 5.2, 1.5], [.9, 5, -6.5], [3, 1.2, -8.6], [9, .5, -8.3], [12.5, .5, -4.5], [12.5, 1.6, 1], [11, 2.8, 5.5], [7.5, 3, 9.8], [4, 7, 9.5], [1.8, 11, 4], [.9, 12.8, 1.1]].map(p => new T.Vector3(...p)), false, 'catmullrom', .4);
  const threadGeo = new T.TubeGeometry(curve, 560, .075, 8, false);
  const thread = new T.Mesh(threadGeo, ym); thread.castShadow = true; pm.add(thread);
  const key = new T.Group(); pm.add(key);
  { const k = M(pm, C.gelb, { r: .35, m: .2, em: C.gelb, ei: .25 }); const bow = new T.Mesh(new T.TorusGeometry(.85, .22, 16, 48), k); bow.position.x = -1.6; const sh = new T.Mesh(new T.BoxGeometry(3, .34, .26), k); sh.position.x = .75; const t1 = new T.Mesh(new T.BoxGeometry(.34, .7, .26), k); t1.position.set(1.4, -.45, 0); const t2 = new T.Mesh(new T.BoxGeometry(.3, .5, .26), k); t2.position.set(2.05, -.35, 0); [bow, sh, t1, t2].forEach(m => { m.castShadow = true; key.add(m); }); }
  anchor(pm, 'lay-pm', 17, 0, 6);
  const keyAnchor = new T.Object3D(); key.add(keyAnchor); A.key = keyAnchor;

  /* Tausend gleiche Häuser */
  const many = grp(null, 'many');
  const N = 10, SP = 38, cells = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const x = (i - N / 2 + .5) * SP, z = (j - N / 2 + .5) * SP; if (Math.abs(x) < SP * .6 && Math.abs(z) < SP * .6) continue; cells.push([x, z, Math.hypot(x, z) / (N * SP * .62)]); }
  const mA = new T.InstancedMesh(new T.BoxGeometry(15.4, 3.3, 13.65), M(many, 0x6f665d), cells.length);
  const mB = new T.InstancedMesh(new T.BoxGeometry(8, 2.1, 17.2), M(many, 0xB39878), cells.length);
  const rpG = (() => { const sh = new T.Shape(); sh.moveTo(-4.2, 0); sh.lineTo(4.2, 0); sh.lineTo(0, 4.2); sh.closePath(); const g = new T.ExtrudeGeometry(sh, { depth: 17.6, bevelEnabled: false }); g.translate(0, 0, -8.8); return g; })();
  const mC = new T.InstancedMesh(rpG, M(many, 0x2f2f2e, { r: .75 }), cells.length);
  many.add(mA, mB, mC);
  const grid = new T.GridHelper(N * SP, N, C.anth, C.anth); grid.material.transparent = true; grid.material.userData.base = .7; many.userData.mats.push(grid.material); grid.position.set(0, .01, 0); many.add(grid); many.userData.grid = grid;

  const catcher = new T.Mesh(new T.PlaneGeometry(240, 240), new T.ShadowMaterial({ opacity: .55, transparent: true })); catcher.rotation.x = -Math.PI / 2; catcher.position.y = .002; catcher.receiveShadow = true;

  /* Gesamtkosten: jedes Teil des Projekts wird zum Block im Kostenturm */
  const cost = grp(root, 'cost'), cblk = [];
  [['haus', 8.4, C.weiss, [-1.8, 1.3]], ['garage', 2.6, C.kalk, [-12.8, 4.5]], ['zufahrt', 1.3, C.anth, [-6, 10.2]], ['garten', 2.0, C.salbei, [11.5, -9]]].forEach(([id, h, col, src]) => {
    const g = new T.Group(); cost.add(g); const geo = new T.BoxGeometry(5, h, 5); geo.translate(0, h / 2, 0);
    const m = new T.Mesh(geo, M(cost, col, { r: .85 })); m.castShadow = m.receiveShadow = true; g.add(m); g.add(new T.LineSegments(new T.EdgesGeometry(geo), LM(cost, id === 'zufahrt' ? C.kalk : C.schwarz, .4)));
    anchor(g, 'c-' + id, 5, h / 2, 2.5); cblk.push({ id, h, g, src }); });
  { let y = 0; cblk.forEach(c => { c.y = y; y += c.h + .08; }); const top = new T.Object3D(); top.position.set(20 + 5, y + .2, 2.5); cost.add(top); A['c-top'] = top; }
  cost.userData.blk = cblk;
  { const Hb = 12.8, bl = new T.Group(); cost.add(bl); const ym = M(cost, C.gelb, { r: .7 }), cx = 17.5, cz = -2.5, w = 3.5, t = .06;
    box(bl, cx - w, Hb - t, cz - w, cx + w, Hb + t, cz - w + .12, ym); box(bl, cx - w, Hb - t, cz + w - .12, cx + w, Hb + t, cz + w, ym); box(bl, cx - w, Hb - t, cz - w, cx - w + .12, Hb + t, cz + w, ym); box(bl, cx + w - .12, Hb - t, cz - w, cx + w, Hb + t, cz + w, ym);
    anchor(bl, 'budget', cx + w, Hb, cz + w); bl.visible = false; cost.userData.bl = bl; }
  /* Open Space: wenige Lastenpunkte, Wände frei */
  const osp = grp(root, 'osp');
  { const wm = M(osp, 0xEAE8E3, { r: .9 }), cm = M(osp, 0xFFFFFF, { r: .7 });
    [[-3.1, -1.8], [-3.1, 3.4], [1.0, .9]].forEach(([x, z]) => { const c = new T.Mesh(new T.CylinderGeometry(.2, .2, 2.8, 24), cm); c.position.set(x, 1.4, z); c.castShadow = true; osp.add(c); });
    const walls = []; for (let i = 0; i < 4; i++) { const g = new T.BoxGeometry(1, 2.6, .12); g.translate(.5, 1.3, 0); const m = new T.Mesh(g, wm); m.castShadow = m.receiveShadow = true; if (i % 2) m.rotation.y = -Math.PI / 2; osp.add(m); walls.push(m); }
    osp.userData.walls = walls;
    osp.userData.L = [[[.95, 2.4, 4.65], [1.02, 2.4, 5.45], [-2.95, -1.5, 4.95], [2.0, -5.2, 3.7]], [[3.4, 2.4, 2.2], [1.02, 6.4, 1.45], [-2.95, -1.5, .9], [2.0, -5.2, .8]], [[-.6, 4.2, 3.2], [2.6, 4.2, 3.65], [3.0, -1.4, 2.6], [3.0, -5.2, 3.8]]]; }
  anchor(osp, 'osp', 1.0, 2.9, .9);

  /* Behördenwege: drei Planblätter */
  const docs = grp(root, 'docs'), sheets = [];
  { const SW = 6.4, SH = 4.5, draw = [
      (x, w, h) => { x.strokeStyle = '#111'; x.lineWidth = 2; x.strokeRect(14, 14, w - 28, h - 28); x.strokeRect(w - 150, h - 60, 136, 46);
        const gx = 90, gy = h - 70; x.beginPath(); x.moveTo(gx, gy); x.lineTo(gx + 300, gy); x.lineTo(gx + 300, gy - 80); x.lineTo(gx + 230, gy - 80); x.lineTo(gx + 230, gy - 120); x.lineTo(gx + 150, gy - 220); x.lineTo(gx + 70, gy - 120); x.lineTo(gx + 70, gy - 80); x.lineTo(gx, gy - 80); x.closePath(); x.stroke();
        x.lineWidth = 1; [[gx + 20, gy - 60, 40, 50], [gx + 120, gy - 70, 70, 60], [gx + 240, gy - 60, 40, 50], [gx + 120, gy - 175, 60, 45]].forEach(r => x.strokeRect(...r));
        x.beginPath(); x.moveTo(gx, gy + 20); x.lineTo(gx + 300, gy + 20); [gx, gx + 300].forEach(v => { x.moveTo(v, gy + 12); x.lineTo(v, gy + 28); }); x.stroke(); },
      (x, w, h) => { x.strokeStyle = '#111'; x.lineWidth = 2; x.strokeRect(14, 14, w - 28, h - 28); const g = ['#3a3a3a', '#555', '#707070', '#8a8a8a', '#a4a4a4', '#bdbdbd', '#d2d2d2'];
        g.forEach((c, i) => { x.fillStyle = c; x.fillRect(50, 50 + i * 36, 120 + i * 38, 26); }); x.fillStyle = '#111'; x.beginPath(); x.moveTo(470, 63); x.lineTo(440, 50); x.lineTo(440, 76); x.closePath(); x.fill(); x.fillRect(440, 60, 40, 6); },
      (x, w, h) => { x.strokeStyle = '#111'; x.lineWidth = 2; x.strokeRect(14, 14, w - 28, h - 28); const b = h - 90; x.beginPath(); x.moveTo(80, b); x.lineTo(430, b); x.moveTo(80, b); x.lineTo(255, b - 170); x.lineTo(430, b); x.moveTo(255, b - 170); x.lineTo(255, b); x.moveTo(167, b - 85); x.lineTo(255, b); x.lineTo(343, b - 85); x.stroke();
        x.lineWidth = 1; for (let i = 0; i < 7; i++) { const px = 110 + i * 48; x.beginPath(); x.moveTo(px, 40); x.lineTo(px, 70); x.moveTo(px - 6, 62); x.lineTo(px, 70); x.lineTo(px + 6, 62); x.stroke(); }
        x.setLineDash([5, 5]); x.beginPath(); x.moveTo(80, b + 30); x.quadraticCurveTo(255, b + 110, 430, b + 30); x.stroke(); },
      (x, w, h) => { x.strokeStyle = '#111'; x.lineWidth = 2; x.strokeRect(14, 14, w - 28, h - 28); x.lineWidth = 1; for (let i = 0; i < 9; i++) { const gx = 60 + i * 46; x.beginPath(); x.moveTo(gx, 40); x.lineTo(gx, h - 40); x.strokeStyle = '#c8c8c8'; x.stroke(); }
        x.strokeStyle = '#111'; [[0, 2], [1, 3], [2, 5], [4, 7], [6, 8]].forEach(([a, b2], i) => { x.fillStyle = i === 2 ? '#FFB200' : '#555'; x.fillRect(60 + a * 46, 60 + i * 50, (b2 - a) * 46, 22); });
        x.beginPath(); x.moveTo(60 + 5.4 * 46, 36); x.lineTo(60 + 5.4 * 46, h - 36); x.lineWidth = 2; x.stroke(); } ];
    draw.forEach((d, i) => { const t = tex((x, w, h) => { x.fillStyle = '#F4F3F0'; x.fillRect(0, 0, w, h); d(x, w, h); }, 512, 362);
      const top = M(docs, 0xffffff, { map: t, r: .9 }), side = M(docs, 0xE8E6E1, { r: .9 });
      const m = new T.Mesh(new T.BoxGeometry(SW, .04, SH), [side, side, top, side, side, side]); m.castShadow = m.receiveShadow = true; docs.add(m); sheets.push(m);
      anchor(m, 'doc' + i, SW / 2, .1, -SH / 2 + .4); }); }

  /* Baustelle: Kran, Gerüst, Mulde */
  const site = grp(root, 'site');
  const crane = new T.Group(); crane.position.set(-13.4, 0, -9.6); site.add(crane);
  const mast = new T.Group(), jib = new T.Group(); crane.add(mast); crane.add(jib);
  { const cm = M(site, C.weiss, { r: .6 }), cl2 = LM(site, C.kalk, .9), MH = 24, MW = .8;
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b]) => box(mast, a * MW - .06, 0, b * MW - .06, a * MW + .06, MH, b * MW + .06, cm));
    const br = []; for (let y = 0; y < MH; y += 1.6) { const y2 = y + 1.6; br.push([-MW, y, -MW, MW, y2, -MW], [MW, y, MW, -MW, y2, MW], [-MW, y, MW, -MW, y2, -MW], [MW, y, -MW, MW, y2, MW], [-MW, y2, -MW, MW, y2, -MW], [-MW, y2, MW, MW, y2, MW]); } segs(mast, br, cl2);
    jib.position.y = MH;
    box(jib, -8, 0, -.5, 26, .12, -.38, cm); box(jib, -8, 0, .38, 26, .12, .5, cm); box(jib, 0, 1.6, -.06, 26, 1.72, .06, cm);
    const jb = []; for (let x = 0; x < 26; x += 1.3) jb.push([x, .12, -.44, x + .65, 1.66, 0], [x + .65, 1.66, 0, x + 1.3, .12, -.44], [x, .12, .44, x + .65, 1.66, 0], [x + .65, 1.66, 0, x + 1.3, .12, .44]); segs(jib, jb, cl2);
    box(jib, -7.6, -1.4, -1, -5.4, 0, 1, M(site, C.beton, { r: .95 }));
    box(jib, -.9, -2.4, -.9, .9, 0, .9, cm); box(jib, -.95, -2.2, .91, .95, -.9, .93, M(site, 0x56636e, { r: .1, m: .8 }));
    segs(jib, [[0, 1.7, 0, 0, 5.2, 0], [0, 5.2, 0, 24, 1.72, 0], [0, 5.2, 0, -7.4, .12, 0]], cl2);
    const tro = new T.Group(); jib.add(tro); box(tro, -.4, -.3, -.5, .4, 0, .5, cm);
    const rope = segs(tro, [[0, 0, 0, 0, -1, 0]], LM(site, C.kalk, 1));
    const hook = new T.Group(); tro.add(hook); box(hook, -.25, -.5, -.25, .25, 0, .25, M(site, C.anth));
    const panel = new T.Group(); hook.add(panel); box(panel, -3, -3.4, -.15, 3, -.6, .15, M(site, 0xffffff, { map: tex((x, w, h) => { x.fillStyle = '#B39878'; x.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 8) { x.fillStyle = 'rgba(70,50,30,.32)'; x.fillRect(i, 0, 1.4, h); } let sd = 5; const rn = () => (sd = (sd * 16807) % 2147483647) / 2147483647; for (let k = 0; k < 140; k++) { x.fillStyle = rn() < .5 ? 'rgba(90,64,38,.10)' : 'rgba(240,220,190,.10)'; x.fillRect(Math.floor(rn() * 32) * 8 + 1.4, 0, 6.6, h); } }, 256, 256, [3.75, 1.75]), r: .85 }), LM(site, C.schwarz, .3)); box(panel, -1.4, -2.9, .15, 1.2, -1.2, .19, M(site, 0x56636e, { r: .05, m: .9 }));
    segs(panel, [[0, 0, 0, -2.6, -.6, 0], [0, 0, 0, 2.6, -.6, 0]], LM(site, C.kalk, .9));
    Object.assign(site.userData, { mast, jib, tro, rope, hook });
    anchor(panel, 'kran', 3, -2, 0); }
  const scaf = new T.Group(); site.add(scaf);
  { const x0 = -10.6, x1 = 7, z0 = -8.6, z1 = 10.8, Y = [0, 2.5, 5, 7.5], st = [], lm = LM(site, C.kalk, .85), pm2 = M(site, C.sand, { r: .9 });
    const along = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + (b - a) * i / n);
    along(x0, x1, 7).forEach(x => [z0, z1].forEach(z => st.push([x, 0, z, x, 8.5, z])));
    along(z0, z1, 8).forEach(z => [x0, x1].forEach(x => st.push([x, 0, z, x, 8.5, z])));
    Y.slice(1).forEach(y => { st.push([x0, y, z0, x1, y, z0], [x0, y, z1, x1, y, z1], [x0, y, z0, x0, y, z1], [x1, y, z0, x1, y, z1], [x0, y + 1, z0, x1, y + 1, z0], [x0, y + 1, z1, x1, y + 1, z1]);
      box(scaf, x0, y - .05, z1 - .02, x1, y, z1 + .7, pm2); box(scaf, x0, y - .05, z0 - .7, x1, y, z0 + .02, pm2); box(scaf, x1 - .02, y - .05, z0, x1 + .7, y, z1, pm2); });
    segs(scaf, st, lm); anchor(scaf, 'geruest', x1 + .7, 8.5, z1); }
  const mulde = new T.Group(); site.add(mulde);
  { const sh = new T.Shape(); sh.moveTo(-2, 0); sh.lineTo(2, 0); sh.lineTo(2.9, 1.6); sh.lineTo(-2.9, 1.6); sh.closePath(); const g = new T.ExtrudeGeometry(sh, { depth: 2, bevelEnabled: false }); g.translate(0, 0, -1);
    const m = new T.Mesh(g, M(site, C.anth, { r: .8 })); m.castShadow = true; m.add(new T.LineSegments(new T.EdgesGeometry(g), LM(site, C.kalk, .4))); mulde.add(m); anchor(mulde, 'mulde', 2.9, 1.6, 0); }
  mulde.rotation.y = Math.PI / 2; Object.assign(site.userData, { scaf, mulde });

  /* Innenarchitektur: Materialmuster und Licht */
  const ia = new T.Group(); ia.name = 'ia'; root.add(ia);
  { const chips = [[0xC9B79E, [2.2, .12, -.2]], [0xD9CFBF, [-.2, .5, -4.2]], [0x8B907C, [3.7, .5, 4.6]], [0xCACACA, [-3.1, 2.2, 3.0]]].map(([col, to], i) => {
      const m = new T.Mesh(new T.BoxGeometry(1.5, .14, 1.5), new T.MeshStandardMaterial({ color: col, roughness: .8, transparent: true, opacity: 0 })); m.castShadow = true; m.userData = { from: [-4.6 + i * 2.6, 7.2, 1.3], to }; ia.add(m); return m; });
    const gt = radTex(128, [[0, 1], [.45, .45], [1, 0]]);
    const pools = [[3.3, -3.05], [2.6, 6.8], [3.8, -.1], [.2, -4.2], [-6.6, -4.4], [-2, 6.2]].map(([px, pz]) => {
      const gl = new T.Mesh(new T.PlaneGeometry(3.6, 3.6), new T.MeshBasicMaterial({ map: gt, color: 0xFFD7A8, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false })); gl.rotation.x = -Math.PI / 2; gl.position.set(px, .1, pz);
      const pd = new T.Mesh(new T.CylinderGeometry(.22, .22, .06, 20), new T.MeshBasicMaterial({ color: 0xFFE7C4, transparent: true, opacity: 0 })); pd.position.set(px, 2.7, pz); ia.add(gl, pd); return { gl, pd }; });
    ia.userData = { chips, pools }; anchor(ia, 'iaChips', 4.2, 7.4, 1.3); anchor(ia, 'iaLicht', 2.6, 2.9, 6.8); }

  /* Hero: Vitrine, Drehteller, Familie, Licht an der Haustür */
  const hero = { hdoor };
  { const vitr = grp(null, 'vitr'), vw = 12.6, vh = 11.4; wire(vitr, -vw, 0, -vw, vw, vh, vw, LM(vitr, 0xFFFFFF, .55));
    const pm = BM(vitr, 0xFFFFFF, .03);
    [[0, -vw, 0], [0, vw, 0], [-vw, 0, 1], [vw, 0, 1]].forEach(([x, z, r]) => { const p = new T.Mesh(new T.PlaneGeometry(vw * 2, vh), pm); p.position.set(x, vh / 2, z); p.rotation.y = r * Math.PI / 2; vitr.add(p); });
    const tp = new T.Mesh(new T.PlaneGeometry(vw * 2, vw * 2), pm); tp.rotation.x = -Math.PI / 2; tp.position.y = vh; vitr.add(tp);
    hero.vitr = vitr; }
  { const tt = grp(pivot, 'tt'), g = new T.CylinderGeometry(12.8, 12.8, .34, 120), m = new T.Mesh(g, M(tt, 0x1c1c1b, { r: .55 })); m.position.y = -.18; m.receiveShadow = true; tt.add(m);
    const tk = []; for (let i = 0; i < 120; i++) { const a = i / 120 * Math.PI * 2, r0 = i % 10 ? 12.25 : 11.6; tk.push([Math.cos(a) * r0, .006, Math.sin(a) * r0, Math.cos(a) * 12.65, .006, Math.sin(a) * 12.65]); }
    segs(tt, tk, LM(tt, C.kalk, .5)); hero.tt = tt; }
  { const fam = new T.Group(); fam.name = 'fam'; root.add(fam);
    const person = (h, col, kid) => {
      const mat = new T.MeshStandardMaterial({ color: col, roughness: .78 });
      const g = new T.Group(), hipY = (kid ? .46 : .5) * h, shY = (kid ? .78 : .82) * h, hr = (kid ? .09 : .072) * h;
      const cap = (r, len) => { const q = new T.CapsuleGeometry(r, Math.max(.01, len - 2 * r), 6, 14); q.translate(0, -len / 2, 0); return q; };
      const part = (geo, parent) => { const m = new T.Mesh(geo, mat); m.castShadow = true; parent.add(m); return m; };
      const hip = new T.Group(); hip.position.y = hipY; g.add(hip);
      const tl = hipY * .52, sl = hipY - tl;
      const legs = [-1, 1].map(sd => { const th = new T.Group(); th.position.x = sd * .056 * h; hip.add(th); part(cap(.048 * h, tl + .03 * h), th); const kn = new T.Group(); kn.position.y = -tl; th.add(kn); part(cap(.039 * h, sl - .012 * h), kn);
        const ft = new T.Mesh(new T.BoxGeometry(.06 * h, .03 * h, .13 * h), mat); ft.position.set(0, -sl + .015 * h, .03 * h); ft.castShadow = true; kn.add(ft); return { th, kn }; });
      const tor = new T.Group(); hip.add(tor);
      { const len = shY - hipY + .08 * h, q = new T.CapsuleGeometry(.088 * h, len - .176 * h, 6, 16); q.translate(0, len / 2 - .04 * h, 0); const m = part(q, tor); m.scale.set(1.22, 1, .72); }
      const head = new T.Group(); head.position.y = shY - hipY + .035 * h + hr; tor.add(head); part(new T.SphereGeometry(hr, 20, 14), head);
      const ua = (kid ? .17 : .19) * h, fa = (kid ? .15 : .17) * h;
      const arms = [-1, 1].map(sd => { const sh = new T.Group(); sh.position.set(sd * .136 * h, shY - hipY - .025 * h, 0); tor.add(sh); part(cap(.03 * h, ua), sh); const el = new T.Group(); el.position.y = -ua; sh.add(el); part(cap(.026 * h, fa), el); return { sh, el }; });
      g.userData = { h, hip, hipY, legs, arms, tor, head, mat }; return g;
    };
    hero.figs = [[1.84, 0xE4E0D8, 0], [1.7, 0xD9D2C6, 0], [1.3, 0xECEAE5, 1], [1.02, 0xF2F0EB, 1]].map(([h, c, k]) => { const p = person(h, c, k); fam.add(p); return p; });
    hero.fam = fam; }
  { const fx = new T.Group(); fx.name = 'heroFx'; root.add(fx);
    const glow = new T.Mesh(new T.PlaneGeometry(2.2, 2.6), new T.MeshBasicMaterial({ color: 0xFFD9AC, transparent: true, opacity: 0, fog: false })); glow.position.set(-2, 1.3, EZ1 - .9); fx.add(glow);
    const st = spillTex();
    const spill = new T.Mesh(new T.PlaneGeometry(2.8, 4), new T.MeshBasicMaterial({ map: st, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false }));
    spill.rotation.x = -Math.PI / 2; spill.position.set(-2, .025, EZ1 + 2); fx.add(spill);
    const lamp = new T.PointLight(0xFFD2A0, 0, 14, 1.4); lamp.position.set(-2, 1.6, EZ1 + 1.2); fx.add(lamp); anchor(fx, 'heroLicht', -2, 2.5, EZ1 + .8);
    Object.assign(hero, { glow, spill, lamp }); }

  /* Zaun um das Grundstück, Lücke an der Zufahrt */
  const zaun = grp(root, 'zaun');
  { const X0 = -16.5, X1 = 16.5, Z0 = -12.5, Z1 = 12.5, H = 1.3, posts = [], rails = [];
    const pm = M(zaun, 0x1d1d1c, { r: .45, m: .7 }), cm = M(zaun, 0x2a2a29, { r: .4, m: .7 }), lm = LM(zaun, C.kalk, .35);
    const am = datTex(64, 4, x => x < 40 ? [255, 255, 255, 255] : [0, 0, 0, 0], false); am.wrapS = T.RepeatWrapping; am.magFilter = T.NearestFilter; am.minFilter = T.LinearFilter;
    const wc = document.createElement('canvas'); wc.width = 256; wc.height = 64; const wx = wc.getContext('2d'); wx.fillStyle = '#B49E7F'; wx.fillRect(0, 0, 256, 64);
    for (let i = 0; i < 90; i++) { wx.fillStyle = 'rgba(70,52,34,' + (.05 + (i % 7) * .015) + ')'; wx.fillRect(0, (i * 37) % 64, 256, 1); }
    const wt = new T.CanvasTexture(wc); wt.colorSpace = T.SRGBColorSpace; wt.wrapS = T.RepeatWrapping;
    const lamM = {}, lam = bl => { const k = bl.toFixed(2); if (lamM[k]) return lamM[k]; const A2 = am.clone(); A2.needsUpdate = true; A2.repeat.set(bl / .09, 1); const W2 = wt.clone(); W2.needsUpdate = true; W2.repeat.set(bl / 2, 1);
      const m = new T.MeshStandardMaterial({ color: 0xffffff, map: W2, alphaMap: A2, alphaTest: .5, roughness: .85, side: T.DoubleSide }); m.userData.base = 1; zaun.userData.mats.push(m); return lamM[k] = m; };
    const run = (a, b) => { const L2 = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L2 / 2.2)), bl = L2 / n, ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      for (let i = 0; i < n; i++) { const f = (i + .5) / n, bay = new T.Group(); bay.position.set(a[0] + (b[0] - a[0]) * f, 0, a[1] + (b[1] - a[1]) * f); bay.rotation.y = -ang; zaun.add(bay);
        const pl = new T.Mesh(new T.PlaneGeometry(bl - .08, H - .16), lam(bl)); pl.position.y = .08 + (H - .16) / 2; pl.castShadow = true; bay.add(pl);
        const p = new T.Mesh(new T.BoxGeometry(.07, H + .04, .07), pm); p.position.set(-bl / 2, (H + .04) / 2, 0); p.castShadow = true; bay.add(p);
        const cap = new T.Mesh(new T.BoxGeometry(bl, .035, .09), cm); cap.position.y = H; bay.add(cap);
        if (i === n - 1) { const q = p.clone(); q.position.x = bl / 2; bay.add(q); }
        posts.push(bay); }
      rails.push([a[0], .03, a[1], b[0], .03, b[1]]); };
    [[[-1.1, Z1], [X1, Z1]], [[X1, Z1], [X1, Z0]], [[X1, Z0], [X0, Z0]], [[X0, Z0], [X0, Z1]], [[X0, Z1], [-9.6, Z1]]].forEach(([a, b]) => run(a, b));
    zaun.userData.posts = posts; zaun.userData.rails = segs(zaun, rails, lm); anchor(zaun, 'zaun', X1, H, Z1); }

  /* Energiefluss vom Dach ins Netz */
  const netz = grp(root, 'netz');
  { const P3 = [[5.3, 5.3, 8.4], [6.3, .12, 8.4], [6.3, .12, 13.2], [16, .12, 13.2]].map(v => new T.Vector3(...v)), segL = [], tot = [0];
    for (let i = 1; i < P3.length; i++) { segL.push(P3[i].distanceTo(P3[i - 1])); tot.push(tot[i - 1] + segL[i - 1]); }
    const path = u => { const d = u * tot[tot.length - 1]; let i = 0; while (i < segL.length - 1 && d > tot[i + 1]) i++; return P3[i].clone().lerp(P3[i + 1], (d - tot[i]) / segL[i]); };
    const line = new T.Line(new T.BufferGeometry().setFromPoints(P3), new T.LineBasicMaterial({ color: C.gelb, transparent: true, opacity: 0 })); netz.add(line);
    const dg = new T.BoxGeometry(.2, .2, .2), dots = Array.from({ length: 16 }, () => { const d = new T.Mesh(dg, new T.MeshBasicMaterial({ color: C.gelb, transparent: true, opacity: 0 })); netz.add(d); return d; });
    Object.assign(netz.userData, { line, dots, path }); anchor(netz, 'netz', 6.3, 1.2, 10.6); }

  /* Montage: vorgefertigte Holzrahmen-Module mit Fenster und Fassade. Nur im Header Komplex */
  const rohbau = grp(root, 'rohbau');
  { const RB = rohbau, inner = M(RB, 0xEAE6DE, { r: .9 }), clt = M(RB, 0xD8C29A, { r: .85 }), bet = M(RB, C.beton, { r: .95 }), gl = M(RB, 0x56636e, { r: .05, m: .9 }), al = M(RB, 0x2a2c2e, { r: .45, m: .5 }), st = M(RB, 0x1d1d1c, { r: .5, m: .6 }), ed = LM(RB, C.schwarz, .3);
    const larD = (x, w, h) => { x.fillStyle = '#B39878'; x.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 8) { x.fillStyle = 'rgba(70,50,30,.32)'; x.fillRect(i, 0, 1.4, h); } let sd = 5; const rn = () => (sd = (sd * 16807) % 2147483647) / 2147483647; for (let k = 0; k < 140; k++) { x.fillStyle = rn() < .5 ? 'rgba(90,64,38,.10)' : 'rgba(240,220,190,.10)'; x.fillRect(Math.floor(rn() * 32) * 8 + 1.4, 0, 6.6, h); } };
    const fac = (kind, w, h) => kind === 'stein' ? M(RB, 0xffffff, { map: stoneTex([w / 3.08, h / 3]), r: .95 }) : M(RB, 0xffffff, { map: tex(larD, 256, 256, [w / 1.6, h / 1.6]), r: .85 });
    const B = (a, b, c, d, e, f, m, eg) => box(RB, Math.min(a, d), Math.min(b, e), Math.min(c, f), Math.max(a, d), Math.max(b, e), Math.max(c, f), m, eg);
    const mod = (axis, c, out, u0, u1, y0, h, kind, wins = [], door) => {
      const P = (u, y, v) => axis === 'x' ? [u, y, c + v] : [c + v, y, u], bx2 = (ua, ya, va, ub, yb, vb, m, eg) => { const p = P(ua, ya, va), q = P(ub, yb, vb); B(p[0], p[1], p[2], q[0], q[1], q[2], m, eg); };
      bx2(u0, y0, -.15 * out, u1, y0 + h, .13 * out, inner, ed); bx2(u0, y0, .13 * out, u1, y0 + h, .16 * out, fac(kind, u1 - u0, h));
      wins.forEach(([w0, w1, h0, h1]) => { bx2(u0 + w0, y0 + h0, .16 * out, u0 + w1, y0 + h1, .18 * out, gl); [[w0, w0 + .07], [w1 - .07, w1]].forEach(([p0, p1]) => bx2(u0 + p0, y0 + h0, .16 * out, u0 + p1, y0 + h1, .19 * out, al)); [[h0, h0 + .07], [h1 - .07, h1]].forEach(([p0, p1]) => bx2(u0 + w0, y0 + p0, .16 * out, u0 + w1, y0 + p1, .19 * out, al)); });
      if (door) bx2(u0 + door[0], y0, .16 * out, u0 + door[1], y0 + door[2], .19 * out, al);
    };
    B(EX0 - .3, -.32, EZ0 - .3, EX1 + .3, .02, EZ1 + .3, bet);
    mod('x', EZ1 - .15, 1, EX0, -3.75, .02, 2.98, 'stein', [], [.6, 5.75, 2.45]);
    mod('x', EZ1 - .15, 1, -3.75, -1.2, .02, 2.98, 'stein', [], [1.15, 2.35, 2.4]);
    mod('x', EZ1 - .15, 1, -1.2, 1.3, .02, 2.98, 'stein', [[.4, 2.1, .9, 2.4]]);
    mod('x', EZ1 - .15, 1, 3.8, EX1, .02, 2.98, 'stein', [[.3, 1.8, .9, 2.4]]);
    mod('x', EZ0 + .15, -1, EX0, -4, .02, 2.98, 'stein');
    mod('x', EZ0 + .15, -1, -4, 1, .02, 2.98, 'stein', [[.5, 4.5, .45, 2.5]]);
    mod('x', EZ0 + .15, -1, 1, EX1, .02, 2.98, 'stein', [[.5, 4.4, .45, 2.5]]);
    mod('z', EX0 + .15, -1, EZ0, 1.3, .02, 2.98, 'stein');
    mod('z', EX0 + .15, -1, 1.3, EZ1, .02, 2.98, 'stein', [[2, 4.2, .9, 2.4]]);
    mod('z', EX1 - .15, 1, EZ0, 1.3, .02, 2.98, 'stein', [[1.6, 5.2, .9, 2.4]]);
    B(EX0, 3.0, EZ0, EX1, 3.3, EZ1, clt, ed); B(BX - HW, 3.0, BZ0, BX + HW, 3.3, EZ0, clt, ed); B(BX - HW, 3.0, EZ1, BX + HW, 3.3, BZ1, clt, ed);
    mod('z', BX - HW + .15, -1, BZ0, 1.1, YB, KW, 'larch', [[2.6, 6.2, .4, 1.9]]);
    mod('z', BX - HW + .15, -1, 1.1, BZ1, YB, KW, 'larch', [[1.8, 6.4, .4, 1.9]]);
    { const g = ext(pent(HW, 0, KW, KW + RP), .3), m = new T.Mesh(g, fac('larch', 2 * HW, KW + RP)); m.position.set(BX, YB, BZ0); m.castShadow = m.receiveShadow = true; m.add(new T.LineSegments(new T.EdgesGeometry(g), ed)); RB.add(m);
      const gw = new T.Mesh(ext(pent(2.2, .5, KW - .2, KW + RP - 1.4), .04), gl); gw.position.set(BX, YB, BZ0 - .03); RB.add(gw); }
    const strut = (x0, y0, z0, x1, y1, z1) => { const v = new T.Vector3(x1 - x0, y1 - y0, z1 - z0), L = v.length(), o = new T.Mesh(new T.BoxGeometry(.08, L, .08), st); o.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); o.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), v.normalize()); o.castShadow = true; RB.add(o); };
    [-4.8, -.6, 3.6, 7.6].forEach(z => strut(BX - HW + 2.4, 3.3, z, BX - HW + .25, YB + KW - .2, z));
    [-3.8, .2].forEach(z => strut(EX1 - 2.2, .02, z, EX1 - .3, 2.7, z));
    const tz = 15.6, cabM = M(RB, 0x0b0b0b, { r: .35, m: .2 }); B(-3.5, .9, tz - 1.25, 8.6, 1.2, tz + 1.25, st, ed); B(-3.5, .5, tz - 1.2, 8.6, .9, tz + 1.2, cabM); B(8.8, .5, tz - 1.25, 11.6, 3.3, tz + 1.25, cabM, ed); B(11.59, 1.8, tz - 1.05, 11.63, 2.9, tz + 1.05, gl); B(8.8, 3.3, tz - 1.15, 11.2, 3.75, tz + 1.15, cabM, ed);
    const decal = (url, cw, ch, w, h, x, y) => { const t = svgTex(url, cw, ch);
      
      const m = new T.MeshBasicMaterial({ map: t, transparent: true, alphaTest: .08 }); m.userData.base = 1; RB.userData.mats.push(m); return [1, -1].map(sd => { const p = new T.Mesh(new T.PlaneGeometry(w, h), m); p.position.set(x, y, tz + sd * 1.262); if (sd < 0) p.rotation.y = Math.PI; RB.add(p); return p; }); };
    B(-3.5, 1.2, tz - 1.25, 8.4, 4.3, tz + 1.25, M(RB, 0x121212, { r: .92 }), ed); B(-3.55, 1.2, tz - 1.27, -3.45, 4.3, tz + 1.27, cabM); B(8.35, 1.2, tz - 1.27, 8.45, 4.3, tz + 1.27, cabM);
    RB.userData.logo = decal(LOGO_INV, 1024, 1030, 2.3, 2.31, 5.7, 2.78);
    decal(CLAIM_W, 2048, 330, 4.4, .71, -.2, 2.25);
    [-2.2, 0, 6.6, 10.3].forEach(x => [-1.1, 1.1].forEach(dz => { const w = new T.Mesh(new T.CylinderGeometry(.5, .5, .36, 20), M(RB, 0x111111, { r: .8 })); w.rotation.x = Math.PI / 2; w.position.set(x, .5, tz + dz); RB.add(w); }));
  }

  /* Sonnenbahn über dem Grundstück */
  const sonne = grp(root, 'sonne');
  { const at = u => { const a = Math.PI * u; return new T.Vector3(-Math.cos(a) * 21, 1 + Math.sin(a) * 9, -6 - Math.sin(a) * 8); }, pts = []; for (let i = 0; i <= 80; i++) pts.push(at(i / 80));
    const l = new T.Line(new T.BufferGeometry().setFromPoints(pts), LM(sonne, C.kalk, .7, true)); l.computeLineDistances(); sonne.add(l);
    const sun = new T.Mesh(new T.SphereGeometry(.7, 24, 16), BM(sonne, C.gelb, 1)); sonne.add(sun); anchor(sun, 'sonne', 0, .9, 0); Object.assign(sonne.userData, { at, sun }); }

  /* Machbarkeit: Gelände, Baurecht, Haus-Studie, Aussicht */
  const topo = grp(root, 'topo');
  { const lm = LM(topo, C.kalk, .55); topo.userData.lines = [];
    [3, 5.5, 8, 10.5, 13, 15.5].forEach((r0, k) => { const p = []; for (let i = 0; i <= 140; i++) { const a = i / 140 * Math.PI * 2, r = r0 * (1 + .12 * Math.sin(a * 3 + k) + .06 * Math.sin(a * 5 + k * 2)); p.push(new T.Vector3(Math.max(-15.8, Math.min(15.8, 5 + Math.cos(a) * r * 1.25)), .05 + k * .004, Math.max(-11.8, Math.min(11.8, -4 + Math.sin(a) * r)))); }
      const l = new T.Line(new T.BufferGeometry().setFromPoints(p), lm); topo.add(l); topo.userData.lines.push(l); });
    anchor(topo, 'gelaende', 12, .1, -9); }
  const huell = grp(root, 'huell');
  { const g = new T.BoxGeometry(26, 9.5, 20.8); g.translate(0, 4.75, 0); huell.add(new T.Mesh(g, BM(huell, 0xFFFFFF, .05))); huell.add(new T.LineSegments(new T.EdgesGeometry(g), LM(huell, 0xFFFFFF, .55))); anchor(huell, 'huell', 13, 9.5, 10.4); }
  const ghost = grp(root, 'ghost'), gfill = grp(ghost, 'gfill');
  { const cx = -1.8, cz = 1.3; ghost.position.set(cx, 0, cz);
    const r = (x0, x1, z0, z1, y) => [[x0, y, z0, x1, y, z0], [x1, y, z0, x1, y, z1], [x1, y, z1, x0, y, z1], [x0, y, z1, x0, y, z0]];
    const S2 = [...r(EX0 - cx, EX1 - cx, EZ0 - cz, EZ1 - cz, 0), ...r(EX0 - cx, EX1 - cx, EZ0 - cz, EZ1 - cz, EH), ...[[EX0, EZ0], [EX1, EZ0], [EX1, EZ1], [EX0, EZ1]].map(([x, z]) => [x - cx, 0, z - cz, x - cx, EH, z - cz])];
    const gx0 = BX - HW - cx, gx1 = BX + HW - cx, gz0 = BZ0 - cz, gz1 = BZ1 - cz, ye = YB + KW, yr = YB + KW + RP, bxc = BX - cx;
    S2.push(...r(gx0, gx1, gz0, gz1, YB), ...r(gx0, gx1, gz0, gz1, ye), [gx0, YB, gz0, gx0, ye, gz0], [gx1, YB, gz0, gx1, ye, gz0], [gx0, YB, gz1, gx0, ye, gz1], [gx1, YB, gz1, gx1, ye, gz1], [gx0, ye, gz0, bxc, yr, gz0], [gx1, ye, gz0, bxc, yr, gz0], [gx0, ye, gz1, bxc, yr, gz1], [gx1, ye, gz1, bxc, yr, gz1], [bxc, yr, gz0, bxc, yr, gz1]);
    segs(ghost, S2, LM(ghost, 0xFFFFFF, .95));
    const fill = new T.Mesh(new T.PlaneGeometry(EX1 - EX0, EZ1 - EZ0), BM(gfill, C.gelb, .32)); fill.rotation.x = -Math.PI / 2; fill.position.set((EX0 + EX1) / 2 - cx, .06, (EZ0 + EZ1) / 2 - cz); gfill.add(fill);
    anchor(ghost, 'ghost', bxc, yr + .4, 0); }
  const blick = grp(root, 'blick');
  { const w = new T.Mesh(new T.CircleGeometry(17, 40, -.42, .84), BM(blick, C.gelb, .16)); w.rotation.x = -Math.PI / 2; blick.add(w); blick.position.set(-1.8, .07, 1.3); blick.rotation.y = .35; anchor(blick, 'blick', 13, .2, 0); }
  const bcol = grp(root, 'bcol');
  { const g = new T.BoxGeometry(4.2, 1, 4.2); g.translate(0, .5, 0); const col = new T.Group(); col.position.set(23.2, 0, -2.5); bcol.add(col);
    col.add(new T.Mesh(g, BM(bcol, 0xFFFFFF, .07))); col.add(new T.LineSegments(new T.EdgesGeometry(g), LM(bcol, 0xFFFFFF, .7)));
    const cap = new T.Mesh(new T.BoxGeometry(4.4, .14, 4.4), M(bcol, C.gelb, { r: .7 })); cap.position.set(23.2, 0, -2.5); bcol.add(cap);
    const lvl = new T.Mesh(new T.BoxGeometry(10.7, .05, .05), new T.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0 })); lvl.position.set(20.1, 0, .12); bcol.add(lvl);
    const an = anchor(bcol, 'budget', 25.5, 0, -.4), al = anchor(bcol, 'lvl', 25.7, 0, .12);
    Object.assign(bcol.userData, { col, cap, lvl, an, al }); }
  const kst = grp(root, 'kst');
  { const KB = [], cx = 14, cz = -2.5;
    [['haus', 6.0, C.weiss], ['garage', 1.9, C.kalk], ['zufahrt', 1.7, C.anth], ['terrasse', 1.7, C.sand], ['pool', 2.0, C.beton], ['sauna', 1.7, 0x887254], ['garten', 1.8, C.salbei]].forEach(([id, h, col]) => {
      const g = new T.Group(); g.position.set(cx, 0, cz); kst.add(g); const geo = new T.BoxGeometry(4.2, 1, 4.2); geo.translate(0, .5, 0);
      const m = new T.Mesh(geo, M(kst, col, { r: .85 })); m.castShadow = m.receiveShadow = true; g.add(m); g.add(new T.LineSegments(new T.EdgesGeometry(geo), LM(kst, id === 'zufahrt' ? C.kalk : C.schwarz, .4)));
      const an = new T.Object3D(); kst.add(an); A['k-' + id] = an; KB.push({ id, h, g, an }); });
    const top = new T.Object3D(); kst.add(top); A['k-top'] = top; Object.assign(kst.userData, { KB, top, cx, cz }); }
  const skizze = grp(root, 'skizze');
  { let sd = 21; const rn = () => (sd = (sd * 16807) % 2147483647) / 2147483647, P = [];
    const stroke = (pts, jit = .06, os = .3, passes = 2) => { for (let ps = 0; ps < passes; ps++) { const off = ps ? (rn() - .5) * .08 : 0; let prev = null; const ex = pts.slice();
        if (os && pts.length === 2) { const [a, b] = pts, dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1; ex[0] = [a[0] - dx / L * os * rn(), a[1] - dz / L * os * rn()]; ex[1] = [b[0] + dx / L * os * rn(), b[1] + dz / L * os * rn()]; }
        for (let i = 0; i < ex.length - 1; i++) { const a = ex[i], b = ex[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, n = Math.max(2, Math.ceil(L / .35)), nx = -(b[1] - a[1]) / L, nz = (b[0] - a[0]) / L, bow = (rn() - .5) * .12;
          for (let j = 0; j <= n; j++) { if (i > 0 && j === 0) continue; const f = j / n, w = Math.sin(Math.PI * f) * bow + (rn() - .5) * jit + off, p = [a[0] + (b[0] - a[0]) * f + nx * w, .07, a[1] + (b[1] - a[1]) * f + nz * w]; if (prev) P.push(...prev, ...p); prev = p; } } } };
    const rect = (x0, z0, x1, z1, j, o) => { stroke([[x0, z0], [x1, z0]], j, o); stroke([[x1, z0], [x1, z1]], j, o); stroke([[x1, z1], [x0, z1]], j, o); stroke([[x0, z1], [x0, z0]], j, o); };
    const circ = (cx, cz, r, a0 = 0, a1 = Math.PI * 2, j = .04) => { const p = [], n = Math.max(8, Math.ceil(r * 10 * (a1 - a0) / 6.28)); for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; p.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); } stroke(p, j, 0, 1); };
    rect(EX0, EZ0, EX1, EZ1, .07, .45);
    [[[-9.5, -1.78], [-6.4, -1.78]], [[-5.2, -1.78], [-3.25, -1.78]], [[-3.25, EZ0], [-3.25, -1.78]], [[.95, 2.42], [EX1, 2.42]], [[1.02, 2.42], [1.02, EZ1]], [[EX0, 2.5], [-3.75, 2.5]], [[-3.75, 2.5], [-3.75, EZ1]]].forEach(q => stroke(q, .05, .25));
    rect(-2.75, -.4, -1.55, 2.2, .03, .1); for (let i = 1; i < 8; i++) stroke([[-2.75, -.4 + i * .32], [-1.55, -.4 + i * .32]], .02, 0, 1);
    circ(-6.4, -1.78, 1.2, -Math.PI / 2, 0); circ(1.02, 4.2, .9, 0, Math.PI / 2); circ(-2, EZ1, 1.0, Math.PI, Math.PI * 1.5);
    rect(-.6, -4.65, .2, -1.7, .03, .08); rect(.2, -4.65, 1, -3.9, .03, .08);
    rect(2.6, -4, 4.05, -2.1, .03, .1); [[2.3, -3.5], [2.3, -2.6], [4.35, -3.5], [4.35, -2.6], [3.3, -4.3], [3.3, -1.8]].forEach(([x, z]) => circ(x, z, .22, 0, Math.PI * 2, .02));
    rect(2.1, -.6, 5.45, .4, .03, .1); rect(-9, -5, -7.3, -4.1, .03, .05);
    [[-8.4, -6.85], [-5.8, -4.25]].forEach(([a, b]) => rect(a, 2.9, b, 7, .03, .05));
    rect(BX - HW, BZ0, BX + HW, BZ1, .09, .5);
    for (let i = 0; i < 9; i++) { const x = EX0 + .6 + i * 1.7; stroke([[x, EZ0 - 3.8], [x + 1.6, EZ0 - .3]], .04, .1, 1); }
    stroke([[EX0, EZ1 + 2], [EX1, EZ1 + 2]], .02, .4, 1); [EX0, EX1].forEach(x => stroke([[x, EZ1 + 1.6], [x, EZ1 + 2.4]], .02, 0, 1));
    circ(2.2, -3.1, 3.4, .3, Math.PI * 2.15, .09);
    circ(10.5, -8.5, .9); stroke([[10.5, -7.3], [10.5, -9.8]], .02, 0, 1); stroke([[10.1, -9.2], [10.5, -9.8], [10.9, -9.2]], .02, 0, 1);
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(P, 3)); const l = new T.LineSegments(g, LM(skizze, 0xFFFFFF, .9)); skizze.add(l);
    const pen = new T.Mesh(new T.SphereGeometry(.16, 12, 8), BM(skizze, C.gelb, 1)); skizze.add(pen);
    Object.assign(skizze.userData, { l, pen, n: P.length / 6, pos: P }); anchor(skizze, 'skizze', EX1 + .4, .1, EZ0 + 1); }

  /* Nur Services v2 steuert diese Teile; andere Seiten sehen sie nie */
  ['tt', 'cost', 'osp', 'docs', 'site', 'ia', 'fam', 'heroFx', 'zaun', 'pvA', 'netz', 'rohbau', 'sonne', 'topo', 'huell', 'ghost', 'blick', 'bcol', 'skizze', 'kst'].forEach(n => { const g = root.getObjectByName(n) || pivot.getObjectByName(n); if (g) g.visible = false; });
  const revealC = new T.Color(0xC9AA82);
  return { kst, topo, huell, ghost, gfill, blick, bcol, skizze, sonne, rohbau, pvA: root.getObjectByName('pvA'), netz, zaun, ia, softMat: soft, reveal: revealC, hero, docs, sheets, site, cost, osp, zInt, zArc, C, GAP, pivot, root, units, U: Object.fromEntries(units.map(u => [u.name, u])), A, front, check, scan, scanEdge, pts, ptsMesh, zones, gvol, deck, up, roof, dim, glas, lamps, roofIns, zeich, zUp, life, larch, roofMat: hul.userData.roofMat, crownMat: gar.userData.crown, wallx, wxL, wallIn: WI, moist, mph, ghostH, pm, spine, thread, threadGeo, key, many, mA, mB, mC, cells, catcher, au };
}

/* GRIFFNER Services v2: Engine. Kamera, Zeitachse P (0 bis 12), Labels im Raum. */
export async function createFilm(host, cfg = {}) {
    const cv = host.querySelector('canvas'), lab = host.querySelector('[data-l3]');
    const R = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: false, powerPreference: 'high-performance' });
    R.setPixelRatio(Math.min(1.75, devicePixelRatio || 1));
    R.outputColorSpace = T.SRGBColorSpace; R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
    R.setClearColor(0x000000, 1);
    const scene = new T.Scene(); scene.fog = new T.Fog(0x000000, 60, 200);
    const cam = new T.PerspectiveCamera(30, 1, .5, 5000);
    const S = buildScene(T);
    const VK = cfg.variant === 'komplex';
    const HC = new T.Vector3(-1.8, 0, 1.3);
    S.pivot.position.copy(HC); S.root.position.copy(HC).multiplyScalar(-1);
    scene.add(S.pivot, S.many, S.catcher);
    { const pg = new T.PMREMGenerator(R), es = new T.Scene(), sg = new T.SphereGeometry(50, 48, 24), col = [], p = sg.attributes.position, c = new T.Color();
      for (let i = 0; i < p.count; i++) { const y = p.getY(i) / 50; if (y > .05) c.setRGB(.55 + .35 * y, .6 + .33 * y, .66 + .3 * y); else if (y > -.08) c.setRGB(.42, .45, .48); else c.setRGB(.05, .05, .05); col.push(c.r, c.g, c.b); }
      sg.setAttribute('color', new T.Float32BufferAttribute(col, 3)); es.add(new T.Mesh(sg, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide })));
      const env = pg.fromScene(es, .02).texture; scene.traverse(o => { if (o.material && o.material.userData && o.material.userData.glass) { o.material.envMap = env; o.material.envMapIntensity = 1.5; } }); pg.dispose(); }
    const hemi = new T.HemisphereLight(0xffffff, 0x2a2a2a, 1.7); scene.add(hemi);
    const sun = new T.DirectionalLight(0xffffff, 2.3); sun.position.set(-26, 42, 20); sun.castShadow = true;
    Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 140 }); sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0004; sun.shadow.normalBias = .03;
    scene.add(sun, sun.target);
    const fill = new T.DirectionalLight(0xffffff, .9); fill.position.set(34, 18, 30); scene.add(fill);
    const rim = new T.DirectionalLight(0xffffff, .4); rim.position.set(20, 10, -34); scene.add(rim);
    S.root.getObjectByName('heroFx').visible = true;
    const H = S.hero; H.vitr.position.copy(HC); scene.add(H.vitr);
    const spot = new T.SpotLight(0xffffff, 0, 0, .42, .8, 0); spot.position.set(HC.x + 6, 38, HC.z + 12); spot.target = S.pivot; scene.add(spot);
    if (VK) { spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -.0004; }
    const spotPool = (() => { const tx = radTex(256, [[0, 1], [.55, .5], [1, 0]]); const m = new T.Mesh(new T.PlaneGeometry(2, 2), new T.MeshBasicMaterial({ map: tx, color: 0xFFF1DE, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, fog: false }));
      m.rotation.x = -Math.PI / 2; m.position.set(HC.x + .6, .04, HC.z); m.visible = false; scene.add(m); return m; })();

    const cl = t => Math.max(0, Math.min(1, t)), sm = t => (t = cl(t), t * t * (3 - 2 * t));
    const K = [
      [0, 32, 14, 70, -1, 4.4, 1.3], [.44, 26, 12, 62, -1, 4.2, 1.3], [.74, 10, 7, 48, -3.4, 3, 6], [.98, 4, 7, 42, -4.4, 2.6, 9.4],
      [1.36, 14, 6, 28, -3.6, 1.9, 9.4], [1.54, 32, 22, 54, -1, 1.5, 3], [1.95, 54, 40, 82, 1.5, 0, -.5],
      [2.6, 36, 30, 84, 0, 0, 1], [3.3, 40, 12, 196, 0, 34, 0], [3.9, 47, 14, 190, 0, 34, 0],
      [4.4, 18, 50, 92, 0, 0, 1], [4.68, 12, 44, 92, 0, 1, 1], [4.98, 30, 32, 84, 0, 1.5, 1],
      [5.2, 0, 68, 104, -6, 0, 1], [5.27, 10, 30, 80, 19, 8, -2.5], [5.36, 12, 10, 64, 19.5, 10, -2.5], [5.5, 16, 8, 64, 19.5, 10, -2.5], [5.62, 30, 32, 72, -1.5, 3, 1.3], [5.73, 38, 30, 70, -1.5, 3, 1.3], [5.8, 16, 72, 64, 0, 0, 1.3], [5.87, 24, 70, 62, 0, 0, 1.3], [5.93, 20, 50, 128, 17, -4, -11], [5.99, 28, 47, 128, 17, -4, -11],
      [6.35, 22, 12, 60, -1.8, -.6, 1.3], [6.9, 34, 15, 56, -1.8, -.6, 1.3],
      [7.2, 34, 20, 78, 0, 4.4, 1.3], [7.95, 52, 19, 76, 0, 4.4, 1.3],
      [8.35, 50, 58, 54, 0, .5, 1.3], [8.9, 68, 54, 50, 0, .5, 1.3],
      [9.35, 30, 34, 90, 1, 0, 0], [9.9, 12, 22, 66, 0, 3, 1.3],
      [10.3, 24, 12, 56, 0, 3, 1.3], [10.48, 40, 12, 54, -2, 2.5, 5], [10.62, 18, 14, 50, -3.5, 1.4, 8.5], [10.76, 30, 11, 34, -3.6, 1.2, 10], [10.95, 46, 12, 32, -3.4, 1.2, 9.6],
      [11.35, 45, 42, 330, 0, 0, 0], [11.85, 54, 50, 270, 0, 0, 0], [12, 56, 34, 112, 0, 3, 0]
    ];
    const camAt = P => {
      let i = 0; while (i < K.length - 2 && P >= K[i + 1][0]) i++;
      const a = K[i], b = K[i + 1], f = sm((P - a[0]) / (b[0] - a[0]));
      return a.map((v, j) => v + (b[j] - v) * f);
    };
    const tmp = new T.Vector3(), dummy = new T.Object3D(), SET = { focus: null, fk: 0, fx: { roof: 0, wall: 0, dims: 0 }, lastCam: null, P: 0, tP: cfg.P || 0, hover: -1, mx: 0, my: 0, tmx: 0, tmy: 0, w: 0, h: 0, alive: 1 };
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const PL = [[5, 5.2, 5.25, 5.5], [5.2, 5.3, 5.5, 5.5], [5.3, 5.37, 5.77, 5.87], [5.37, 5.45, 5.56, 5.74], [5.45, 5.5, 5.74, 5.74], [5.5, 5.78, 9.5, 10], [5.78, 6, 5.875, 6]];
    const remapP = p => { if (VK && p < 2) return p < 1.5 ? 1.45 : 1.45 + (p - 1.5) / .5 * .53; if (VK && p >= 2 && p < 4) return p < 2.56 ? 2 + (p - 2) / .56 * .85 : 2.85 + (p - 2.56) / 1.44 * 1.15; if (p >= 5 && p < 6) { const g = PL.find(q => p < q[1]) || PL[PL.length - 1]; return g[2] + (p - g[0]) / (g[1] - g[0]) * (g[3] - g[2]); }
      return p >= 6 && p < 7.5 ? 10.07 : p >= 7.5 && p < 8 ? 10.07 + (p - 7.5) / .5 * .43 : p >= 8 && p < 9 ? 7.5 : p >= 9 && p < 10 ? p - .5 : p >= 10 && p < 10.5 ? 10.5 : p; };
    const warp = p => p < 6 ? p : p < 7 ? 6 : p < 7.5 ? 6 + (p - 7) * 2 : p < 9.5 ? p - .5 : p < 10 ? 8.92 : p < 10.1 ? 8.92 + (p - 10) * 9.8 : p < 10.5 ? 9.9 + (p - 10.1) * 1.5 : p;
    const NK = [[6.0, 24, 50, 50, 1, 0, 2], [6.45, 38, 54, 44, 1, 0, 2], [7.0, 50, 50, 46, 1, 0, 2]];
    const camNK = P => { let i = 0; while (i < NK.length - 2 && P >= NK[i + 1][0]) i++; const a = NK[i], b = NK[i + 1], f = sm((P - a[0]) / (b[0] - a[0])); return a.map((v, j) => v + (b[j] - v) * f); };
    const glowU = (u, k) => { if (!u) return; if (!u.userData.gm) { const s2 = new Set(); u.traverse(o => { if (o.isMesh && o.material && !Array.isArray(o.material) && o.material.emissive) s2.add(o.material); }); u.userData.gm = [...s2].filter(m => !(m.emissiveIntensity > 0)); u.userData.gm.forEach(m => m.userData.e0 = m.emissive.getHex()); }
      u.userData.gm.forEach(m => { if (k > .001) { m.emissive.setHex(0xFFB200); m.emissiveIntensity = .32 * k; } else if (m.emissiveIntensity !== 0) { m.emissive.setHex(m.userData.e0); m.emissiveIntensity = 0; } }); };
    const AU = ['terrasse', 'carport', 'pool', 'sauna', 'garten'], ks = (k, a, b) => sm((k - a) / (b - a));
    const ang = (a, b, k) => { const d = ((b - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; return a + d * k; };
    const walk = (pts, k) => { const sl = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); sl.push(l); tot += l; }
      const at = d => { d = Math.max(0, Math.min(tot, d)); for (let i = 0; i < sl.length; i++) { if (d <= sl[i] || i === sl.length - 1) { const f = sl[i] ? Math.min(1, d / sl[i]) : 0, a = pts[i], b = pts[i + 1]; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; } d -= sl[i]; } return pts[pts.length - 1]; };
      const d = tot * cl(k), p = at(d), q = at(d + .5), p0 = at(d - .5); return { x: p[0], z: p[1], d, h: Math.atan2(q[0] - p0[0], q[1] - p0[1]) }; };
    const pose = (f, x, z, hd, d, a, i, t) => { const u = f.userData, ph = d / (u.h * .8) * Math.PI * 2;
      f.position.set(x, 0, z); f.rotation.y = hd;
      u.legs.forEach((l, j) => { const p = ph + j * Math.PI; l.th.rotation.x = -Math.sin(p) * .42 * a; l.kn.rotation.x = a * (.06 + .66 * Math.max(0, Math.cos(p))); });
      u.arms.forEach((r, j) => { const p = ph + j * Math.PI; r.sh.rotation.x = Math.sin(p) * .36 * a; r.sh.rotation.z = (j ? -1 : 1) * .06; r.el.rotation.x = -.14 - .26 * a; });
      u.hip.position.y = u.hipY + (Math.abs(Math.cos(ph)) - .6) * .024 * u.h * a + (1 - a) * Math.sin(t * 1.3 + i) * .002 * u.h;
      u.tor.rotation.x = .05 * a; u.head.rotation.y = (1 - a) * Math.sin(t * .37 + i * 1.7) * .32; u.head.rotation.x = (1 - a) * (u.h < 1.4 ? -.12 : 0); };
    const FA = { f2: [[-3.1, 14.4], [-.9, 14.3], [-2.3, 13.7], [-1.55, 13.95]], b3d: [.05, .08, 0, .025],
      in3: [[-2.3, 9.7], [-1.7, 9.8], [-2.1, 9.3], [-1.9, 9.5]],
      b4: [[[.2, -4.7], [.2, -6.6], [.5, -8.3]], [[1.8, -4.7], [1.8, -6.4], [1.7, -7.7]], [[3.8, -4.7], [3.9, -6.2], [7.5, -4.3]], [[2.7, -4.7], [2.7, -6.4], [4.4, -9.3]]],
      fh4: [Math.PI / 2, Math.atan2(-1, -.5), Math.PI / 2, .5] };
    const setOp = (g, o) => {
      g.visible = o > .004;
      g.userData.mats.forEach(m => { const v = m.userData.base * o; m.opacity = v; m.transparent = v < .999; m.depthWrite = v > .55; });
      const sh = o > .6; if (g.userData.sh !== sh) { g.userData.sh = sh; g.traverse(c => { if (c.isMesh && !c.isInstancedMesh) c.castShadow = sh; }); }
    };

    /* Labels */
    const LABELS = (cfg.labels || []).map(L => {
      const btn = L.kind === 'layer' || L.kind === 'hot', el = document.createElement(btn ? 'button' : 'div');
      if (btn) { el.type = 'button'; el.tabIndex = -1; el.setAttribute('aria-label', String(L.t).replace(/<[^>]+>/g, '') + (L.s ? '. ' + String(L.s).replace(/<[^>]+>/g, '') : '')); } else el.setAttribute('aria-hidden', 'true');
      el.dataset.id = L.id;
      const big = L.kind === 'layer', hot = L.kind === 'hot';
      el.style.cssText = 'position:absolute;left:0;top:0;display:flex;align-items:center;gap:12px;opacity:0;will-change:transform,opacity;white-space:nowrap;pointer-events:none;color:#fff;margin:0;padding:0;border:0;background:none;font:inherit;text-align:left;-webkit-tap-highlight-color:transparent';
      el.innerHTML = L.kind === 'warm' ? `<span style="flex:none;width:24px;height:1px;background:#CFC3B3"></span><span style="font-family:var(--font-display);font-weight:300;font-size:clamp(20px,2vw,36px);line-height:1.05;letter-spacing:0;color:#CFC3B3;background:#000;padding:.12em .32em .16em">${L.t}</span>` : (hot ? `<span style="flex:none;width:16px;height:16px;box-sizing:border-box;border:1px solid currentColor;border-radius:50%;display:grid;place-items:center"><span style="width:5px;height:5px;border-radius:50%;background:currentColor"></span></span>` : `<span style="flex:none;width:${big ? 28 : 16}px;height:1px;background:currentColor"></span>`) + `<span style="position:relative;display:grid;gap:3px;${big ? 'background:#000;padding:6px 9px 7px;' : 'background:#000;padding:6px 9px 7px;'}"><span style="font-family:var(--font-${big ? 'display' : 'text'});font-weight:500;font-size:${big ? 'clamp(13px,1.05vw,17px)' : '11px'};letter-spacing:${big ? '.06em' : '.2em'};text-transform:uppercase">${L.t}</span>${L.s ? `<span data-sub="1" style="font-family:var(--font-text);font-size:${big ? '12px' : '11px'};letter-spacing:${big ? '0' : '.2em'};${big ? 'white-space:normal;max-width:19em;line-height:1.3;text-wrap:pretty;' : 'text-transform:uppercase;'}color:#CACACA">${L.s}</span>` : ''}${L.strike ? '<span data-ls="1" style="position:absolute;left:6px;right:6px;top:50%;height:2px;margin-top:-1px;background:#FFFFFF;transform:scaleX(0);transform-origin:left center"></span>' : ''}</span>`;
      if (L.left) el.style.flexDirection = 'row-reverse';
      if (L.noline && el.firstElementChild) el.firstElementChild.style.display = 'none';
      if (big) {
        el.style.cursor = 'pointer';
        el.addEventListener('pointerenter', () => SET.hover = L.e);
        el.addEventListener('pointerleave', () => SET.hover = -1);
        el.addEventListener('click', () => cfg.onJump && cfg.onJump(L.jump));
      }
      if (hot) { el.style.cursor = 'pointer'; el.addEventListener('click', ev => { ev.stopPropagation(); cfg.onHot && cfg.onHot(L.hot); }); }
      lab.appendChild(el);
      let cn = null, dt = null; if (big) { cn = document.createElement('span'); cn.style.cssText = 'position:absolute;left:0;top:0;height:1px;background:#fff;transform-origin:0 50%;opacity:0;pointer-events:none'; dt = document.createElement('span'); dt.style.cssText = 'position:absolute;left:0;top:0;width:5px;height:5px;border-radius:50%;background:#fff;opacity:0;pointer-events:none'; lab.appendChild(cn); lab.appendChild(dt); }
      return { ...L, el, big, cn, dt, ls: el.querySelector('[data-ls]'), sub: el.querySelector('[data-sub]') };
    });

    const RAW = VK ? {} : null;
    let TAGS = null;
    if (VK && cfg.tags && cfg.tags.words && cfg.tags.words.length) {
      const tl = document.createElement('div'); tl.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden'; host.appendChild(tl);
      let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      const WS = cfg.tags.words, list = [];
      WS.forEach((w, i) => list.push({ w, tier: i < 8 ? 0 : 1 }));
      for (let i = 0; i < 60; i++) list.push({ w: WS[Math.floor(rnd() * WS.length)], tier: 2 });
      const n = list.length, order = list.map((_, i) => i).sort(() => rnd() - .5);
      list.forEach((g, i) => {
        g.ta = .16 + .46 * Math.pow(i / (n - 1), .5); g.tv = .72 + .26 * order.indexOf(i) / (n - 1);
        g.R = g.tier === 0 ? 13 + rnd() * 7 : 10 + rnd() * 22; g.y = g.tier === 0 ? 3 + rnd() * 7 : 1.2 + rnd() * 15; g.ph = rnd() * Math.PI * 2;
        g.om = (g.tier === 0 ? .1 : .12 + rnd() * .22) * (rnd() < .22 ? -1 : 1); g.bob = .3 + rnd() * .9; g.bp = rnd() * 6; g.m = 1;
        const el = document.createElement('span');
        el.style.cssText = 'position:absolute;left:0;top:0;white-space:nowrap;font-family:var(--font-display);font-weight:300;letter-spacing:0;text-transform:uppercase;font-feature-settings:\'liga\' 0;line-height:1;opacity:0;will-change:transform,opacity;font-size:' + (g.tier === 0 ? 40 : g.tier === 1 ? 26 : 20) + 'px;color:' + (g.tier === 2 ? '#CACACA' : '#FFFFFF');
        el.textContent = g.w; tl.appendChild(el); g.el = el; });
      TAGS = { list, clear: cfg.tags.clear, tw: 0, lt: performance.now(), hc: new T.Vector3(HC.x, 4, HC.z), v: new T.Vector3() };
    }

    const FLY = VK && cfg.flyLogo ? { img: document.querySelector(cfg.flyLogo), ms: S.rohbau.userData.logo || [], hid: false } : null;
    const resize = () => {
      const r = host.getBoundingClientRect(), w = Math.max(1, r.width), h = Math.max(1, r.height);
      if (w === SET.w && h === SET.h) return; SET.w = w; SET.h = h;
      R.setSize(w, h, false); cam.aspect = w / h;
      const narrow = w < 900; SET.narrow = narrow; SET.lens = null;
    };
    const lens = () => {
      const w = SET.w, h = SET.h, tv = Math.tan(Math.PI / 12), hoch = SET.narrow && w < h;
      if (hoch) { const tT = SET.tT == null ? 72 : SET.tT, tB = SET.tB == null ? h * .62 - 20 : SET.tB, k = SET.sT == null || reduce ? 1 : .08;
        SET.sT = SET.sT == null ? tT : SET.sT + (tT - SET.sT) * k; SET.sB = SET.sB == null ? tB : SET.sB + (tB - SET.sB) * k; }
      const top = SET.sT, bot = hoch ? Math.max(top + 140, SET.sB) : 0;
      const fit = hoch ? Math.min(2.6, Math.max(1, .3 / (w / h * tv), .8 * h / (bot - top))) : SET.narrow ? 1 : Math.max(1, 1.5 * h / w), oy = hoch ? h / 2 - (top + bot) / 2 : SET.narrow ? h * .13 : 0;
      const key = fit.toFixed(3) + ' ' + oy.toFixed(1); if (SET.lens === key) return; SET.lens = key;
      cam.fov = Math.atan(tv * fit) * 360 / Math.PI;
      cam.setViewOffset(w, h, SET.narrow ? 0 : -w * .17, oy, w, h);
      cam.updateProjectionMatrix();
    };
    const onMove = e => { SET.tmx = e.clientX / innerWidth * 2 - 1; SET.tmy = e.clientY / innerHeight * 2 - 1; };
    addEventListener('pointermove', onMove, { passive: true });
    const t0 = performance.now();

    let inView = true;
    const frame = () => { SET.raf = 0; if (!SET.alive || !inView || document.hidden) return; try { frameX(); } catch (err) { if (!SET.err) { SET.err = 1; console.warn('Services 3D', err); } } SET.raf = requestAnimationFrame(frame); };
    const wake = () => { if (!SET.raf && SET.alive && inView && !document.hidden) SET.raf = requestAnimationFrame(frame); };
    const io = new IntersectionObserver(es => { inView = es.some(x => x.isIntersecting); wake(); }, { rootMargin: '120px 0px' });
    io.observe(host);
    const onVis = () => wake();
    document.addEventListener('visibilitychange', onVis);
    const frameX = () => {
      if (!SET.alive) return;
      resize(); lens();
      SET.P += (SET.tP - SET.P) * (reduce ? 1 : .09);
      SET.mx += (SET.tmx - SET.mx) * .04; SET.my += (SET.tmy - SET.my) * .04;
      const PR = SET.P, PN = remapP(PR), P = warp(PN), t = (performance.now() - t0) / 1000, s = (a, b) => sm((P - a) / (b - a)), sN = (a, b) => sm((PN - a) / (b - a));
      const bk = PR >= 8 && PR < 9 ? PR - 8 : -1, bq = (a, w) => bk < 0 ? 0 : sm((bk - a) / w), bRoof = bq(.1, .14) * (1 - bq(.88, .08)), bDeck = bq(.28, .14) * (1 - bq(.88, .08)), bWall = bq(.5, .08) * (1 - bq(.8, .06)), bDims = bq(.79, .05) * (1 - bq(.93, .05));
      const ek = PR >= 10 && PR < 10.5 ? (PR - 10) * 2 : -1, eq = (a, w) => ek < 0 ? 0 : sm((ek - a) / w), sP = (a, b) => sm((PR - a) / (b - a));
      const autoWall = Math.max(bWall, sN(7.56, 7.64) * (1 - sN(7.92, 8.0))), autoDims = Math.max(bDims, sN(8.03, 8.09) * (1 - sN(8.19, 8.25))), autoDeck = Math.max(bDeck, sm(sN(8.18, 8.24) * (1 - sN(8.31, 8.37)))), autoRoof = Math.max(bRoof, sN(8.31, 8.37) * (1 - sN(8.46, 8.53)));
      const wI = sN(8.5, 8.6) * (1 - sN(9.38, 9.5)); SET.cur = wI > .5 ? ['fenster', 'parkett', 'fliesen', 'bad'][PN < 8.72 ? 0 : PN < 8.92 ? 1 : PN < 9.12 ? 2 : 3] : null;

      /* Kamera */
      const ft = SET.focus ? 1 : 0; SET.fk += (ft - SET.fk) * (reduce ? 1 : .06);
      ['roof', 'wall', 'dims'].forEach(k => { const tg = Math.max(SET.focus && SET.focus.fx && SET.focus.fx[k] ? 1 : 0, k === 'wall' ? autoWall : k === 'dims' ? autoDims : autoRoof); SET.fx[k] += (tg - SET.fx[k]) * (reduce ? 1 : .07); });
      if (SET.focus) SET.lastCam = SET.focus.cam;
      const c = camAt(P);
      { const w = PR > 5.18 && PR < 5.36 ? sm((PR - 5.19) / .02) * (1 - sm((PR - 5.3) / .045)) : 0; if (w > 0 && !SET.focus) { const a = cl((PR - 5.2) / .1), tg = [0, 4 + 10 * a, 80 - 6 * a, 56, -7, 0, 1.3]; for (let j = 1; j < 7; j++) c[j] += (tg[j] - c[j]) * w; } }
      if (PR >= 5.99 && PR < 7.5 && !SET.focus) { const KB = [[6.0, 14, 34, 112, 25, -5, -10], [6.95, 30, 30, 106, 25, -5, -10], [7.02, 26, 32, 112, 19, -7, -12], [7.42, 40, 30, 110, 19, -7, -12], [7.5, 15.9, 27.7, 93, .61, 1.95, 0]];
        let i = 0; while (i < KB.length - 2 && PR >= KB[i + 1][0]) i++; const a = KB[i], b = KB[i + 1], f = sm(cl((PR - a[0]) / (b[0] - a[0]))); for (let j = 1; j < 7; j++) c[j] = a[j] + (b[j] - a[j]) * f; }
      if (VK && PR < 1.62) { const KV = [[0, 18, 30, 98, -1, 2, 1], [.3, 30, 34, 104, -1, 2, 1], [.62, 44, 38, 108, -1, 2, 1], [.98, 50, 26, 88, -1, 2.5, 1.3], [1.25, 36, 14, 60, -1.5, 3, 2], [1.5, 24, 12, 44, -2.4, 2.2, 6]];
        let i = 0; while (i < KV.length - 2 && PR >= KV[i + 1][0]) i++; const a = KV[i], b = KV[i + 1], f2 = sm(cl((PR - a[0]) / (b[0] - a[0]))), w = 1 - sm((PR - 1.45) / .17);
        for (let j = 1; j < 7; j++) c[j] += (a[j] + (b[j] - a[j]) * f2 - c[j]) * w;
        if (!reduce) c[1] += Math.sin(t * .09) * 3 * (1 - sm((PR - .9) / .3)); }
      { const wN = sN(5.97, 6.07) * (1 - sN(6.98, 7.1)); if (wN > 0) { const n = camNK(Math.max(6, Math.min(7, PN))); for (let j = 1; j < 7; j++) c[j] += (n[j] - c[j]) * wN; } }
      { const wa = sm(autoWall), wc = [0, 28, 13, 34, 1.6, 1.6, 8.5]; if (wa > 0 && !SET.focus) for (let j = 1; j < 7; j++) c[j] += (wc[j] - c[j]) * wa; }
      { const tour = (w, st) => { if (w <= 0 || SET.focus) return null; const p = Math.max(st[0][0], Math.min(st[st.length - 1][0], PN)); let i = 0; while (i < st.length - 2 && p >= st[i + 1][0]) i++; const a = st[i], b = st[i + 1], f = sm((p - a[0]) / (b[0] - a[0]));
          for (let j = 1; j < 7; j++) { const v = a[1][j - 1] + (b[1][j - 1] - a[1][j - 1]) * f; c[j] += (v - c[j]) * w; } return a[2] ? a[2].map((v, j) => v + (b[2][j] - v) * f) : null; };
        tour(sm(sN(8.0, 8.08) * (1 - sN(8.46, 8.56))), [[8.1, [30, 12, 40, 3, 1.6, 8.15]], [8.24, [40, 14, 46, 0, 3.6, 3]], [8.4, [62, 24, 52, -1, 6.5, 4.5]]]);
        tour(sm(sN(9.5, 9.56) * (1 - sN(9.98, 10.06))), [[9.52, [36, 60, 27, 2.2, .4, -1.4]], [10.0, [58, 52, 25, 2.2, .4, -1.4]]]);
        SET.lampP = tour(sm(wI), [[8.62, [10, 30, 17, 1.5, 1.2, -5.0], [1.5, 2.2, -3.8]], [8.82, [50, 44, 22, 1.4, .3, -1.2], [1.4, 2.4, -1.2]], [9.02, [40, 56, 20, -5.8, .3, -3.6], [-4.5, 2.4, -3.8]], [9.22, [30, 55, 22, -6.6, .5, -4], [-7.8, 2.4, -4.2]]]); }
      { const key = (w, kk, x) => { if (w <= 0 || SET.focus) return; let i = 0; while (i < kk.length - 2 && x >= kk[i + 1][0]) i++; const a = kk[i], b = kk[i + 1], f = sm(cl((x - a[0]) / (b[0] - a[0]))); for (let j = 1; j < 7; j++) { const v = a[j] + (b[j] - a[j]) * f; c[j] += (v - c[j]) * w; } };
        key(bk < 0 ? 0 : sm(cl(bk / .05)) * (1 - sm(cl((bk - .95) / .05))), [[0, 34, 16, 66, 0, 3.5, 1.3], [.36, 46, 20, 72, 0, 7, 1.3], [.5, 40, 18, 68, 1, 5.5, 4], [.66, 28, 13, 34, 1.6, 1.6, 8.5], [.84, 30, 12, 40, 3, 1.6, 8.15], [1, 36, 16, 62, 0, 3.5, 1.3]], Math.max(0, bk));
        key(ek < 0 ? 0 : sm(cl(ek / .08)) * (1 - sm(cl((ek - .92) / .08))), [[0, 14, 14, 64, 0, 3, 1.3], [.45, 24, 9, 52, 0, 3, 1.3], [1, 36, 9, 48, 0, 3, 1.3]], Math.max(0, ek)); }
      if (SET.fk > .001 && SET.lastCam) { const fk = sm(SET.fk), fc = SET.lastCam; for (let j = 1; j < 7; j++) c[j] = c[j] + (fc[j - 1] - c[j]) * fk; }
      if (SET.cPrev && Math.abs(PN - SET.pnPrev) > .12 && !reduce) { SET.cFrom = SET.cPrev.slice(); SET.cb = 1; }
      if (SET.cb > .002) { const k = sm(SET.cb); for (let j = 1; j < 7; j++) c[j] += (SET.cFrom[j] - c[j]) * k; SET.cb *= .93; }
      SET.cPrev = c.slice(); SET.pnPrev = PN;
      let az = c[1], el = c[2];
      if (!reduce) { az += Math.sin(t * .11) * 1.6 + SET.mx * 2.6; el += Math.sin(t * .08) * .8 - SET.my * 1.4; }
      const A = az * Math.PI / 180, E = el * Math.PI / 180, d = c[3];
      cam.position.set(c[4] + d * Math.cos(E) * Math.sin(A), c[5] + d * Math.sin(E), c[6] + d * Math.cos(E) * Math.cos(A));
      cam.lookAt(c[4], c[5], c[6]);
      scene.fog.near = d * .7; scene.fog.far = d * 2.6;

      /* Drehteller: das Haus als Produkt */
      let sp = (t * .32) % (Math.PI * 2); if (sp > Math.PI) sp -= Math.PI * 2;
      S.pivot.rotation.y = reduce ? 0 : sp * (1 - s(.42, .68));
      const prodK = 1 - s(.44, .7), dusk = VK && PR < 2.15 ? 0 : s(.56, .86) * (1 - s(1.46, 1.8));
      const night = 0;
      sun.intensity = 2.3 * (1 - .35 * prodK - .55 * dusk) * (1 - .62 * night); hemi.intensity = 1.7 * (1 - .4 * prodK - .5 * dusk) * (1 - .55 * night); fill.intensity = .9 * (1 - .6 * dusk); spot.intensity = 2.6 * prodK;
      if (VK && PR < 2.4) { const dk = sm((PR - .9) / .22) * (1 - sm((PR - 1.95) / .35)), sk = sm((PR - 1.0) / .14) * (1 - sm((PR - 1.95) / .35)), wd = sm((PR - 1.45) / .4);
        sun.intensity = 2.3 * (1 - .9 * dk + .3 * dk * wd); hemi.intensity = 1.7 * (1 - .86 * dk + .22 * dk * wd); fill.intensity = .9 * (1 - .92 * dk); rim.intensity = .4 * (1 - dk);
        spot.intensity = 6 * sk; spot.angle = .24 + .34 * wd; spot.penumbra = .55;
        spotPool.material.opacity = .5 * sk; spotPool.scale.setScalar(13 + 17 * wd); spotPool.visible = sk > .01; }
      else { spotPool.visible = false; rim.intensity = .4; }
      S.catcher.visible = P < 2.5;

      /* Einheiten: zusammensetzen, explodieren, schweben, landen */
      const expK = s(3.0, 3.5), ov = s(3.2, 3.5) * (1 - s(3.9, 4.1));
      S.units.forEach(u => {
        const { e, landP, delay } = u.userData;
        const ai = AU.indexOf(u.name);
        let appear = u.name === 'huelle' ? 1 : u.name === 'plan' ? s(2.95, 3.25) : u.name === 'grund' ? s(.5, .62) : ai >= 0 ? s(1.48 + ai * .06, 1.62 + ai * .06) : s(2 + delay * 2, 2.35 + delay * 2);
        if (VK && PR > .86 && PR < 1.5 && (u.name === 'huelle' || u.name === 'fund' || u.name === 'innen')) appear *= PR < 1.1 ? 1 - sm((PR - .9) / .1) : sm((PR - 1.3) / .14);
        if (VK && ai >= 0 && PR < 2.85) { const VT = [1.86, 1.55, 1.96, 2.16, 2.06][ai]; appear = sm((PR - VT) / .08); }
        if (ai >= 0 && PR >= 5.78 && PR < 6.02) appear = sm((PR - [5.864, 5.852, 5.876, 5.888, 5.9][ai] + .004) / .012);
        if (PR >= 4.9 && PR < 5.5 && (u.name === 'huelle' || u.name === 'fund' || u.name === 'innen' || ai >= 0)) appear = 0;
        if (PR >= 5.5 && PR < 5.56 && (u.name === 'huelle' || u.name === 'fund' || u.name === 'innen')) appear *= sm((PR - 5.5) / .04);
        if (u.name === 'grund') { const g = Math.max(.001, s(.48, .86)); u.scale.set(g, 1, g); }
        const ghost = e === 0 ? 0 : s(3.95, 4.35) * (1 - s(landP - .5, landP - .08));
        const land = 1 - s(landP - .5, landP - .08);
        u.position.y = S.GAP * e * Math.min(expK, land) + 5 * ghost - (ai >= 0 ? 1.8 * (1 - appear) : 0);
        let o = appear * (1 - ghost);
        if ((u.name === 'huelle' || u.name === 'fund') && ((PN > 4.92 && PN < 5.32) || (PN > 5.86 && PN < 6.05 && PR < 6))) { const k = PN < 5.5 ? sN(4.94, 5.02) * (1 - sN(5.24, 5.3)) : sN(5.88, 5.93) * (1 - sN(5.99, 6.04)); u.position.y = 5 * ghost * (1 - k); o = Math.max(o, k); }
        if (PR >= 4.9 && PR < 5.5 && (u.name === 'huelle' || u.name === 'fund' || u.name === 'innen' || ai >= 0)) o = 0;
        if (ai >= 0 && PR >= 5.78 && PR < 6.02) { u.position.y = -1.8 * (1 - appear); o = appear; }
        if (u.name === 'grund' && PR > 5 && PR < 5.34) o *= 1 - sm((PR - 5.0) / .03) * (1 - sm((PR - 5.292) / .03));
        if (u.name === 'plan' && PR > 5 && PR < 5.34) o *= sm((PR - 5.3) / .03);
        if (PR >= 6 && PR < 7.5) { const BT = x => 6.05 + .87 * x, b7 = PR < 7;
          if (u.name === 'fund') { const k = b7 ? sm((PR - BT(.16)) / .08) : 1; u.position.y = -.8 * (1 - k); o = k; }
          else if (u.name === 'huelle') { const k = b7 ? sm((PR - BT(.28)) / (BT(.5) - BT(.28))) : 1; u.position.y = 9 * (1 - k) * (1 - k); o = b7 ? sm((PR - BT(.28)) / .02) : 1; }
          else if (u.name === 'innen') { u.position.y = 0; o = b7 ? sm((PR - BT(.62)) / .1) : 1; }
          else if (ai >= 0) { const k = b7 ? 0 : sm((PR - [7.11, 7.04, 7.18, 7.25, 7.32][ai]) / .03); u.position.y = -1.8 * (1 - k); o = k; } }
        if (u.name === 'carport') { const inW = PN > 7.1 && PN < 7.56 && PR < 6.5, k = inW ? sN(7.18, 7.24) * (1 - sN(7.46, 7.52)) : 0; if (inW) { u.position.y = -1.8 * (1 - k); o = k; }
          if (u.userData.hl === undefined) u.userData.hl = u.userData.mats.find(m => m.color && m.color.getHex() === 0x55534f) || null;
          const hm = u.userData.hl; if (hm) { if (!hm.userData.c0) { hm.userData.c0 = hm.color.clone(); hm.userData.c1 = new T.Color(0xCACACA); } hm.color.copy(hm.userData.c0).lerp(hm.userData.c1, k); } }
        if (ai >= 0 && PN > 4.96 && PN < 5.3) { const ord = [1, 0, 2, 3, 4][ai], k = sN(5.02 + ord * .03, 5.07 + ord * .03), out = 1 - sN(5.2, 5.25); u.position.y = -1.8 * (1 - k); o = k * out; }
        if (SET.hover !== -1 && !(Array.isArray(SET.hover) ? SET.hover.includes(e) : e === SET.hover)) o *= 1 - .78 * ov;
        if (u.name === 'innen' && PN > 7.9 && PN < 8.6) o *= sN(8.46, 8.53);
        u.userData.op = o; setOp(u, o);
      });
      const U = S.U;

      /* Projektcheck */
      const ck = s(4.12, 4.3) * (1 - s(4.95, 5.15)); setOp(S.check, ck * U.grund.userData.op);
      const sx = -16 + 32 * s(4.25, 4.85); S.scan.position.x = sx; S.scanEdge.position.x = sx;
      if (ck > 0) { S.pts.forEach(([x, z], i) => { const k = cl((sx - x) / 2.5); dummy.position.set(x, .1 + .12 * k, z); dummy.scale.setScalar(Math.max(.001, k)); dummy.updateMatrix(); S.ptsMesh.setMatrixAt(i, dummy.matrix); }); S.ptsMesh.instanceMatrix.needsUpdate = true; }

      /* Masterplan */
      S.zones.forEach((z, i) => { const zv = P < 4.6 ? 1 : 1 - s(4.9, 5.0); setOp(z, U.plan.userData.op * zv * (1 - s(5.24, 5.29))); });

      /* Hausplanung */
      setOp(S.zeich, sN(5.5, 5.56) * (1 - sN(5.87, 5.91))); S.zUp.scale.y = Math.max(.001, sN(5.54, 5.68) * (1 - sN(5.74, 5.82))); S.zUp.visible = S.zUp.scale.y > .02; S.zInt.visible = S.zArc.visible = P < 5.78;
      if (VK && PR > .9 && PR < 1.7) { const zk = sm((PR - 1.0) / .06) * (1 - sm((PR - 1.4) / .12)); setOp(S.zeich, zk); S.zUp.scale.y = Math.max(.001, sm((PR - 1.08) / .16)); S.zUp.visible = S.zUp.scale.y > .02 && zk > .01; S.zInt.visible = S.zArc.visible = zk > .01; }

      /* Gesamtkosten und Open Space */
      { const bu = PR >= 4.99 && PR < 5.24 ? cl((PR - 5) / .2) : -1, co = bu < 0 ? 0 : sm(bu / .03) * (1 - sm((PR - 5.172) / .02)), BC = S.bcol, bd = BC.userData, KS = S.kst, ku = KS.userData; setOp(S.cost, 0); setOp(KS, co); setOp(BC, co); bd.lvl.visible = false;
        if (co > .004) { const KU = [0, .4, .5, .6, .7, .8, 1], KF = [[1, 1, 1, 1, 1, .93, .93], [1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1], [1, 1, 1, .7, .7, .7, .7], [1, 1, 1, 1, 0, 0, 0], [1, 1, 1, 1, 1, .75, .75]];
          const kv = arr => { let i = 0; while (i < KU.length - 2 && bu >= KU[i + 1]) i++; const f = sm(cl((bu - KU[i]) / (KU[i + 1] - KU[i]))); return arr[i] + (arr[i + 1] - arr[i]) * f; };
          let ycum = 0, HBf = 0; ku.KB.forEach((b, i) => { const fl = KF[i][KF[i].length - 1]; HBf += b.h * fl + (i ? .06 * Math.min(1, fl * 5) : 0); });
          ku.KB.forEach((b, i) => { const ff = kv(KF[i]), gp = i ? .06 * Math.min(1, ff * 5) : 0, k = sm((bu - .04 - i * .045) / .06), hh = Math.max(.001, b.h * ff);
            ycum += gp; b.g.position.y = ycum + (1 - k) * (1 - k) * 9; b.g.scale.set(1, hh, 1); b.g.visible = k > .01 && ff > .01; b.g.position.x = 23.2; b.an.position.set(23.2 + 2.35, ycum + hh / 2, ku.cz + 2.1); ycum += b.h * ff; });
          ku.top.position.set(23.2, 18.6, ku.cz); bd.col.position.x = 14; bd.cap.position.x = 14; bd.an.position.x = 11.75;
          const HB = HBf * sm((bu - .06) / .2) + .001; bd.col.scale.y = HB; bd.cap.position.y = HB + .07; bd.cap.visible = HB > .05; bd.an.position.set(14, 18.6, ku.cz); bd.al.position.set(18.6, HB + 1.6, ku.cz);
          const cv = sm((bu - .8) / .05); bd.lvl.visible = bu > .3; bd.lvl.position.set(18.6, HB, .12); bd.lvl.material.opacity = co * (.45 + .55 * cv); bd.lvl.material.color.setHex(cv > .5 ? 0xFFB200 : 0xFFFFFF); bd.lvl.scale.set(13.4 / 10.7, 1 + 2 * cv, 1 + 2 * cv); } }
      { const oo = sN(5.76, 5.8) * (1 - sN(5.87, 5.9)); setOp(S.osp, oo);
        if (oo > .004) { const Lw = S.osp.userData.L, ab = s(5.8, 5.83), bc = s(5.84, 5.87), up = Math.max(.001, s(5.76, 5.79));
          S.osp.userData.walls.forEach((w, i) => { const A = Lw[0][i], B = Lw[1][i], C2 = Lw[2][i], v = j => A[j] + (B[j] - A[j]) * ab + (C2[j] - B[j]) * bc;
            w.position.set(v(0), 0, v(1)); w.scale.set(Math.max(.001, v(2)), up, 1); }); } }

      /* Fundament: Schnitt durch das Gelände */
      const cut = s(6.0, 6.3) * (1 - s(6.85, 7.05));
      S.front.position.z = 20 * cut; S.front.position.y = -1.5 * cut; setOp(S.front, U.grund.userData.op * (1 - cut * .9));

      /* Hülle und Innen */
      const hl = SET.fx.roof, doll = Math.max(PR >= 5.78 && PR < 5.84 ? 1 - sm((PR - 5.78) / .05) : 0, s(7.95, 8.22) * (1 - s(8.82, 9.05)), sN(8.45, 8.6) * (1 - sN(9.92, 10.04)));
      S.deck.position.set(-16 * doll, .5 * hl + 5 * doll, -18 * doll); S.up.position.set(-16 * doll, 1.1 * hl + 6.5 * doll, -18 * doll); S.roof.position.set(-16 * doll, 3 * hl + 8.5 * doll, -18 * doll); S.roofIns.position.set(0, 1.5 * hl, 0); setOp(S.roofIns, U.huelle.userData.op * SET.fx.roof * (1 - doll));
      if (autoDeck > 0) { S.up.position.y += 2.6 * autoDeck; S.roof.position.y += 2.6 * autoDeck; }
      S.roof.position.y += 2.4 * bRoof;
      { const dm = S.deck.children[0].material; if (!dm.userData.c0) dm.userData.c0 = dm.color.clone(); dm.color.copy(dm.userData.c0).lerp(S.reveal || dm.userData.c0, autoDeck); }
      setOp(S.dim, U.huelle.userData.op * SET.fx.dims);
      const wx = SET.fx.wall; setOp(S.wallx, U.huelle.userData.op * Math.min(1, wx * 3));
      { let z = S.wallIn + .38; S.wxL.forEach((g, i) => { g.position.z = S.wallIn + (z - S.wallIn + i * .46) * wx; z += g.userData.th; }); }
      const mo = sm((SET.fx.wall - .6) / .4); S.moist.visible = mo > .01; S.moist.material.opacity = .85 * mo;
      if (mo > .01) { const a = S.moist.geometry.attributes.position.array, span = 4.6; S.mph.forEach(([x, y, ph, sp], i) => { const k = Math.sin(t * sp + ph) * .5 + .5; a[i * 3] = x; a[i * 3 + 1] = y + Math.sin(t * .7 + ph) * .08; a[i * 3 + 2] = S.wallIn - .5 + k * span * wx; }); S.moist.geometry.attributes.position.needsUpdate = true; }
      const gh = SET.fx.dims; setOp(S.ghostH, U.huelle.userData.op * gh); S.ghostH.position.y = 3 - .24 * sm((gh - .3) / .7);
      let warm = Math.max(PR >= 10 && PR < 10.5 ? sm((PR - 10.06) / .1) * (1 - sm((PR - 10.44) / .05)) : 0, s(8.2, 8.5) * (1 - .55 * s(11.0, 11.3)), s(.56, .86) * (1 - s(2.2, 2.6)) * .9, wI, sN(9.5, 9.52) * (1 - sN(9.98, 10.04)));
      if (VK && PR < 2) warm = .9 * sm((PR - 1.05) / .25);
      if (SET.lampP && wI > .01) S.lamps[0].position.set(...SET.lampP); else S.lamps[0].position.set(1.6, 2.5, -2.6);
      { const on = false, ud = S.ia.userData; S.ia.visible = false;
        if (!S.softMat.userData.c0) { S.softMat.userData.c0 = S.softMat.color.clone(); S.softMat.userData.c1 = new T.Color(0x8B907C); }
        S.softMat.color.copy(S.softMat.userData.c0).lerp(S.softMat.userData.c1, sN(9.7, 9.76) * (1 - sN(10.0, 10.06)));
        if (on) { ud.chips.forEach((m, i) => { const ap = sN(9.53 + i * .025, 9.58 + i * .025), dr = sN(9.62 + i * .03, 9.68 + i * .03), f = m.userData.from, to = m.userData.to;
            m.position.set(f[0] + (to[0] - f[0]) * dr, f[1] + (to[1] - f[1]) * dr + (1 - ap) * 1.5 + Math.sin(Math.PI * dr) * 1.2, f[2] + (to[2] - f[2]) * dr); m.rotation.y = (1 - dr) * .25 * Math.sin(t * .5 + i);
            const o = ap * (1 - ks(dr, .82, 1)); m.material.opacity = o; m.visible = o > .01; });
          ud.pools.forEach((p, i) => { const k = 0; p.gl.material.opacity = .8 * k; p.pd.material.opacity = k; p.gl.visible = p.pd.visible = k > .01; }); } }
      { const gc = S.U.garten.children; for (let i = 0, j = 0; i + 1 < gc.length; i += 2, j++) { const tr = gc[i], cr = gc[i + 1]; if (!tr.geometry || tr.geometry.type !== 'CylinderGeometry') break; if (tr.userData.s0 == null) tr.userData.s0 = tr.scale.x;
        const s0 = tr.userData.s0, k = Math.max(.001, VK && PR < 2.85 ? sm((PR - 2.06 - j * .012) / .08) : s(1.72 + j * .022, 1.86 + j * .022)); tr.scale.set(s0, s0 * k, s0); tr.position.y = 1.2 * s0 * k; cr.scale.setScalar(s0 * k); cr.position.y = 3.4 * s0 * k; } }
      S.glas.emissiveIntensity = .5 * warm; S.lamps.forEach(l => l.intensity = 7 * warm);

      /* Projektmanager */
      const ovK = s(3.0, 3.45) * (1 - s(3.9, 4.3));
      S.spine.visible = ovK > .01; S.spine.scale.set(ovK, Math.max(.001, (S.GAP * 6 + 2) * expK), ovK);
      let kv;
      if (P < 6) { kv = ovK; S.key.position.set(.9, (S.GAP * 6 + 3.4) * expK, 1.1); }
      else { kv = PR >= 8 ? 0 : s(10.22, 10.38); S.key.position.set(.9, 13.2 + 3 * (1 - s(10.22, 10.45)), 1.1); }
      S.key.visible = kv > .01; S.key.scale.setScalar(Math.max(.001, kv)); S.key.rotation.y = t * .7;
      const tk = PR >= 8 ? 0 : s(10.03, 10.32); S.thread.visible = tk > .001;
      S.threadGeo.setDrawRange(0, Math.floor(S.threadGeo.index.count * tk / 3) * 3);

      /* Besser leben: zehn Jahre im Zeitraffer */
      { const L = S.life.userData, on = s(10.52, 10.6) * (1 - s(10.96, 11.02)), u = s(10.55, 10.95), c = ((u * 4) % 1 + 1) % 1;
        const w = .5 + .5 * Math.cos(2 * Math.PI * c), snow = on * Math.pow(w, 3);
        S.life.visible = on > .005; L.snowPlane.material.opacity = .85 * snow; L.snowPlane.visible = snow > .01;
        const fl = L.flakes; fl.visible = snow > .05; fl.material.opacity = .9 * snow;
        if (fl.visible) { const a = fl.geometry.attributes.position.array; L.sd.forEach(([x, y, z, v], i) => { a[i * 3] = x + Math.sin(t * .6 + i) * .3; a[i * 3 + 1] = ((y - t * v * 1.6) % 22 + 22) % 22; a[i * 3 + 2] = z; }); fl.geometry.attributes.position.needsUpdate = true; }
        if (!S._c) S._c = { roof: S.roofMat.color.clone(), larch: S.larch.color.clone(), crown: S.crownMat.color.clone(), w: new T.Color(0xF4F4F2), sal: new T.Color(0x8B907C), kup: new T.Color(0x887254), grey: new T.Color(0x9b9891), tmp: new T.Color() };
        const K = S._c; S.roofMat.color.copy(K.roof).lerp(K.w, snow * .92);
        S.larch.color.copy(K.larch).lerp(K.grey, on * u * .85);
        let cc; if (c < .25) cc = K.tmp.copy(K.w).lerp(K.sal, sm(c / .25)); else if (c < .6) cc = K.tmp.copy(K.sal); else if (c < .85) cc = K.tmp.copy(K.sal).lerp(K.kup, sm((c - .6) / .25)); else cc = K.tmp.copy(K.kup).lerp(K.w, sm((c - .85) / .15));
        S.crownMat.color.copy(K.crown).lerp(cc, on);
        { const dr = s(10.56, 10.7), vz = 24 - 10.6 * (1 - Math.pow(1 - cl((P - 10.56) / .14), 2)), van = L.van; van.position.set(-5.8, 0, vz); van.rotation.y = Math.PI; van.visible = on > .01;
          L.wheels.forEach(w => w.rotation.x = -(vz - 24) / .42);
          L.sideDoor.position.z = .6 - 1.15 * s(10.71, 10.75);
          L.crew.forEach((g, i) => { const k = s(10.74 + i * .03, 10.9 + i * .03), x0 = -4.6, z0 = 11.2 - i * .9, x1 = -1.4 - i * .7, z1 = 9.3 - i * .2; g.visible = on > .01 && P > 10.73 + i * .03; g.position.set(x0 + (x1 - x0) * k, 0, z0 + (z1 - z0) * k + (P > 10.73 ? 0 : 0)); g.rotation.y = Math.atan2(x1 - x0, z1 - z0); g.children[0].scale.y = 1 + (k > 0 && k < 1 ? Math.sin(t * 9 + i) * .06 : 0); g.children[1].position.y = 1.22 + (k > 0 && k < 1 ? Math.abs(Math.sin(t * 9 + i)) * .05 : 0); }); } }

      /* Tausendmal dasselbe Haus */
      const mv = P > 11.0 && P < 12;
      S.many.visible = mv;
      if (mv) {
        setOp(S.many, 1); S.many.userData.grid.material.opacity = .7 * s(11.0, 11.15) * (1 - s(11.75, 11.95));
        S.cells.forEach(([x, z, dd], i) => {
          const h = Math.max(.001, s(11.02 + dd * .26, 11.16 + dd * .26) * (1 - s(11.5 + (1 - dd) * .3, 11.68 + (1 - dd) * .3)));
          const hs = h < .04 ? .001 : 1; dummy.scale.set(hs, h, hs); dummy.position.set(x - 1.8, 1.65 * h, z + 1.3); dummy.updateMatrix(); S.mA.setMatrixAt(i, dummy.matrix);
          dummy.position.set(x + .9, 4.35 * h, z + 1.1); dummy.updateMatrix(); S.mB.setMatrixAt(i, dummy.matrix);
          dummy.position.set(x + .9, 5.4 * h, z + 1.1); dummy.updateMatrix(); S.mC.setMatrixAt(i, dummy.matrix);
        });
        S.mA.instanceMatrix.needsUpdate = S.mB.instanceMatrix.needsUpdate = S.mC.instanceMatrix.needsUpdate = true;
      }

      { const zV = false, zA = PR >= 7 && PR < 8, zW = VK && PR >= 1.2 && PR < 2.6, zo = zA ? sm((PR - 7.39) / .015) : VK && PR < 1.2 ? 0 : zW ? sm((PR - 1.67) / .02) * (1 - sm((PR - 2.46) / .06)) : PR < 6.5 ? sN(7.26, 7.28) * (1 - sN(7.46, 7.52)) : 0, zu = S.zaun.userData; setOp(S.zaun, zo);
        if (zo > .004) { const n = zu.posts.length; zu.posts.forEach((m, i) => { const k = zV ? Math.max(.001, 1 - sm((PR - .8 - i / n * .09) / .02)) : zA ? Math.max(.001, sm((PR - 7.39 - i / n * .06) / .012)) : zW ? Math.max(.001, sm((PR - 1.68 - i / n * .07) / .02)) : Math.max(.001, sN(7.27 + i / n * .1, 7.29 + i / n * .1)); m.scale.y = k; });
          const rk = zA ? sm((PR - 7.44) / .02) : zV ? 1 - sm((PR - .79) / .02) : zW ? sm((PR - 1.75) / .02) * .6 : sN(7.34, 7.38); zu.rails.visible = rk > .01; zu.rails.material.opacity = .9 * rk; } }
      { const pv = S.pvA, nz = S.netz, on = false && ek >= 0; pv.visible = on; nz.visible = on;
        if (on) { const pn = pv.userData.panels, n = pn.length, glow = eq(.42, .1);
          pn.forEach((m, i) => { const k = eq(.06 + i / n * .32, .06); m.visible = k > .01; m.position.y = m.userData.y0 + (1 - k) * 1.2; m.material.opacity = k; m.material.emissiveIntensity = .55 * glow; });
          const fk = eq(.5, .08) * (1 - eq(.94, .05)); nz.userData.line.material.opacity = .5 * fk;
          nz.userData.dots.forEach((d, i) => { const u = (t * .12 + i / nz.userData.dots.length) % 1; d.position.copy(nz.userData.path(u)); d.visible = fk > .02; d.material.opacity = fk; }); } }
      /* Besser bauen: Behördenwege, Baustelle */
      setOp(U.fund, U.fund.userData.op * (1 - sN(5.98, 6.04) * (1 - sN(6.98, 7.06))));
      if (VK && PR < 1.2) { const dv = 1 - sm((PR - .74) / .08); setOp(S.docs, dv);
        S.sheets.forEach((m, i) => { const k = sm((PR - .72 - i * .012) / .07); m.scale.setScalar(.5); m.position.set(9.4 + i * .5 + k * 5, .04 + i * .04 + k * k * 12, 6.6 - i * .4 - k * 3); m.rotation.set(-.6 * k, (i - 1.5) * .12 + k * .9, .3 * k); }); }
      else { const dv = sN(6.04, 6.1) * (1 - sN(6.9, 6.98)); setOp(S.docs, dv);
        if (dv > .004) S.sheets.forEach((m, i) => { const k = sN(6.06 + i * .07, 6.18 + i * .07), q = 1 - k; m.scale.setScalar(1);
          m.position.set(1 + i * .35 + q * 6, .04 + i * .06 + q * q * 14, 2 - i * .25 - q * 4); m.rotation.set(q * -.9, (i - 1) * .07 + q * .8, q * .4); }); }
      { const bl = PR >= 6 && PR < 7, so = VK && PR < 1.02 ? 1 : bl ? sm((PR - 6.1) / .03) * (1 - sm((PR - 6.9) / .04)) : 0, u = S.site.userData; setOp(S.site, so);
        if (bl && so > .004) { const ms = Math.max(.001, sm((PR - 6.11) / .06) * (1 - sm((PR - 6.84) / .05))), jv = Math.max(.001, sm((PR - 6.16) / .03) * (1 - sm((PR - 6.8) / .03))); u.mast.scale.y = ms; u.jib.position.y = 24 * ms; u.jib.scale.set(jv, 1, 1); u.jib.visible = jv > .02 && ms > .05;
          u.jib.rotation.y = .5 + Math.sin(t * .21) * .7; u.tro.position.set(13 + Math.sin(t * .33) * 5, 0, 0); const hy = -5 - (Math.sin(t * .27) * .5 + .5) * 9; u.hook.position.y = hy; u.rope.scale.y = Math.max(.001, -hy); u.hook.rotation.y = Math.sin(t * .5) * .08;
          const sc = Math.max(.001, sm((PR - 6.27) / .05) * (1 - sm((PR - 6.8) / .04))); u.scaf.scale.y = sc; u.scaf.visible = sc > .01; u.mulde.position.set(11.6, 0, 9.5 + 17 * (1 - sm((PR - 6.12) / .05)) + 17 * sm((PR - 6.86) / .05)); }
        else if (so > .004 && VK) { const ms = Math.max(.001, 1 - sm((PR - .9) / .08)), jr = Math.max(.001, 1 - sm((PR - .86) / .05)); u.mast.scale.y = ms; u.jib.position.y = 24 * ms; u.jib.scale.set(jr, 1, 1); u.jib.visible = jr > .02 && ms > .05;
          u.jib.rotation.y = .5 + Math.sin(t * .21) * .75; u.tro.position.set(13 + Math.sin(t * .33) * 5, 0, 0); const hy = -5 - (Math.sin(t * .27) * .5 + .5) * 9; u.hook.position.y = hy; u.rope.scale.y = Math.max(.001, -hy); u.hook.rotation.y = Math.sin(t * .5) * .08;
          const sc = Math.max(.001, 1 - sm((PR - .84) / .08)); u.scaf.scale.y = sc; u.scaf.visible = sc > .01; u.mulde.position.set(11.6, 0, 9.5 + 17 * sm((PR - .76) / .08)); }
        else if (so > .004) { u.mast.scale.y = Math.max(.001, sN(6.52, 6.7)); const jv = sN(6.66, 6.76); u.jib.visible = jv > .01; u.jib.position.y = 24 * u.mast.scale.y; u.jib.scale.set(Math.max(.001, jv), 1, 1);
          u.jib.rotation.y = .9 - 1.25 * sN(6.7, 7.4); const tx = 9 + 9 * sN(6.76, 7.2); u.tro.position.set(tx, 0, 0); const hy = -4 - 12 * sN(6.8, 7.3);
          u.hook.position.y = hy; u.rope.scale.y = Math.max(.001, -hy); u.hook.rotation.y = Math.sin(t * .5) * .08;
          u.scaf.scale.y = Math.max(.001, sN(6.6, 6.84)); u.scaf.visible = u.scaf.scale.y > .01;
          const mz = 22 - 12.5 * sN(6.72, 6.86); u.mulde.position.set(11.6, 0, mz); } }

      if (RAW) { const want = PR < 1.05; setOp(S.rohbau, want ? 1 - sm((PR - .9) / .1) : 0); if (want) { S.U.huelle.visible = false; S.U.innen.visible = false; } }
      { const tv = PN > 4.05 && PN < 4.8 && PR < 5, tp = tv ? sN(4.1, 4.14) * (1 - sN(4.7, 4.76)) : 0; setOp(S.topo, tp);
        if (tp > .004) { const k = sN(4.1, 4.34); S.topo.userData.lines.forEach((l, i) => l.geometry.setDrawRange(0, Math.ceil(141 * cl(k * 1.6 - i * .12)))); }
        const hv = PN > 4.48 && PN < 5.02 && PR < 5 ? sN(4.5, 4.55) * (1 - sN(4.74, 4.8)) : 0; setOp(S.huell, hv); if (hv > .004) S.huell.scale.y = Math.max(.001, sN(4.52, 4.64));
        const gv = PR < 5 ? (PN > 4.68 && PN < 5.02 ? sN(4.7, 4.74) : 0) : PR < 5.24 ? 1 - sm((PR - 5.0) / .025) : 0; setOp(S.ghost, gv);
        if (gv > .004) { const KG = [[4.72, -.75, 3], [4.79, .6, -2], [4.85, -.28, 1], [4.9, 0, 0]]; let i = 0; while (i < KG.length - 2 && PN >= KG[i + 1][0]) i++; const a = KG[i], b = KG[i + 1], f = sm(cl((PN - a[0]) / (b[0] - a[0])));
          S.ghost.rotation.y = a[1] + (b[1] - a[1]) * f; S.ghost.position.x = -1.8 + a[2] + (b[2] - a[2]) * f; }
        setOp(S.gfill, gv * sN(4.9, 4.93));
        const bv = PN > 4.86 && PN < 5.02 && PR < 5 ? sN(4.89, 4.93) * (1 - sN(4.97, 5)) : 0; setOp(S.blick, bv); if (bv > .004) { const k = Math.max(.001, sN(4.89, 4.95)); S.blick.scale.set(k, 1, k); }
        const so = PN > 4.74 && PN < 5.02 && PR < 5 ? sN(4.77, 4.81) * (1 - sN(4.97, 5)) : 0; setOp(S.sonne, so); if (so > .004) { const u = S.sonne.userData; u.sun.position.copy(u.at(.08 + .84 * sN(4.78, 4.98))); } }
      { const sv = PR > 5.19 && PR < 5.36 ? sm((PR - 5.222) / .012) * (1 - sm((PR - 5.31) / .03)) : 0; setOp(S.skizze, sv);
        if (sv > .004) { const u = S.skizze.userData, k = 1 - Math.pow(1 - cl((PR - 5.226) / .08), 1.6), n = Math.max(1, Math.floor(u.n * k)); u.l.geometry.setDrawRange(0, n * 2); const j = (n * 2 - 1) * 3; u.pen.position.set(u.pos[j], u.pos[j + 1] + .1, u.pos[j + 2]); u.pen.visible = k < .995; } }
      if (PR >= 5.44 && PR < 5.5) setOp(S.zeich, 1 - sm((PR - 5.46) / .035));
      if (PR > 5.7 && PR < 6.1) { const pk = a => sm((PR - a) / .006) * (1 - sm((PR - a - .016) / .01)), AT = [5.876, 5.864, 5.888, 5.9, 5.912]; glowU(U.huelle, 0); glowU(U.fund, 0); AU.forEach((n, i) => glowU(U[n], 0 * pk(AT[i]))); SET.glowOn = 1; }
      else if (SET.glowOn) { SET.glowOn = 0; glowU(U.huelle, 0); glowU(U.fund, 0); AU.forEach(n => glowU(U[n], 0)); }
      { const IA = U.innen.userData.IA; if (IA) { const on = PR >= 5.48 && PR < 5.8, f = a => on ? sm((PR - a) / .03) : 1, fk = Math.max(.001, f(5.515));
          U.innen.userData.old.forEach(c => c.visible = !on); IA.floor.scale.set(fk, 1, 1); IA.floor.position.x = -9.5 * (1 - fk); IA.ein.scale.y = Math.max(.001, f(5.55));
          IA.moe.children.forEach((c, i) => { if (c.userData.y0 == null) c.userData.y0 = c.position.y; const k = on ? sm((PR - 5.595 - (i % 14) * .0035) / .02) : 1; c.position.y = c.userData.y0 + (1 - k) * (1 - k) * 4; c.visible = k > .01; });
          IA.dek.children.forEach((c, i) => { const k = on ? sm((PR - 5.655 - (i % 16) * .003) / .018) : 1; c.scale.setScalar(Math.max(.001, k)); c.visible = k > .01; }); } }
      if (PR >= 6 && PR < 7.5) { if (!S.bx) { const root = U.huelle.parent, ym = op => new T.MeshBasicMaterial({ color: 0xFFB200, transparent: true, opacity: op, depthWrite: false, side: T.DoubleSide });
          const plate = (op, edge) => { const g = new T.Group(), pg = new T.PlaneGeometry(1, 1), m = new T.Mesh(pg, ym(op)); g.add(m); if (edge) g.add(new T.LineSegments(new T.EdgesGeometry(pg), new T.LineBasicMaterial({ color: 0xFFB200, transparent: true, opacity: 1 }))); g.rotation.x = -Math.PI / 2; g.visible = false; g.renderOrder = 5; root.add(g); return g; };
          const bb = new T.Box3().setFromObject(U.fund), hb = new T.Box3().setFromObject(U.huelle), H = hb.max.y - U.huelle.position.y;
          const scan = plate(.16, 1); scan.scale.set(bb.max.x - bb.min.x + .8, bb.max.z - bb.min.z + .8, 1); scan.position.set((bb.min.x + bb.max.x) / 2, 0, (bb.min.z + bb.max.z) / 2);
          const fp = AU.map(n => { const b = new T.Box3().setFromObject(U[n]), p = plate(.85, 0); p.userData.sz = [b.max.x - b.min.x + .5, b.max.z - b.min.z + .5]; p.position.set((b.min.x + b.max.x) / 2, .09, (b.min.z + b.max.z) / 2); return p; });
          S.bx = { scan, fp, H }; }
        const B = S.bx, SC = [[6.25, 6.31], [6.5, 6.57], [6.79, 6.87]].find(([a, b]) => PR > a && PR < b);
        B.scan.visible = false && !!SC; if (SC) { const k = (PR - SC[0]) / (SC[1] - SC[0]); B.scan.position.y = .1 + k * (B.H + .4); const op = Math.sin(Math.PI * k); B.scan.children[0].material.opacity = .2 * op; B.scan.children[1].material.opacity = op; }
        B.fp.forEach((p, i) => { const t = [7.11, 7.04, 7.18, 7.25, 7.32][i], k1 = cl((PR - (t - .022)) / .016), fd = 1 - cl((PR - (t + .02)) / .03), v = k1 * fd; p.visible = PR >= 7 && v > .01 && AU[i] !== 'garten'; if (p.visible) { const g = .55 + .45 * sm(k1); p.scale.set(p.userData.sz[0] * g, p.userData.sz[1] * g, 1); p.children[0].material.opacity = .8 * v; } }); }
      else if (S.bx) { S.bx.scan.visible = false; S.bx.fp.forEach(p => p.visible = false); }
      if (PR >= 10 && PR < 10.5) { if (!S.bk) { const root = U.huelle.parent; root.updateMatrixWorld(true); const inv = new T.Matrix4().copy(root.matrixWorld).invert(), hb = new T.Box3().setFromObject(U.huelle), c = hb.getCenter(new T.Vector3()); c.y = 0;
          const shM = new T.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0, depthWrite: false, side: T.FrontSide }), outer = new T.Group(), inner = new T.Group(); outer.position.copy(c); inner.position.copy(c).multiplyScalar(-1); outer.add(inner); root.add(outer); outer.visible = false;
          const glass = []; U.huelle.traverse(o => { if (!o.isMesh || !o.geometry) return; const m = new T.Mesh(o.geometry, shM); m.matrixAutoUpdate = false; m.matrix.copy(inv).multiply(o.matrixWorld); inner.add(m);
            const mt = o.material; if (mt && !Array.isArray(mt) && mt.color && mt.color.getHex() === 0x56636e) { o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox, sz = b.getSize(new T.Vector3()), ax = sz.x < sz.y && sz.x < sz.z ? 'x' : sz.y < sz.z ? 'y' : 'z', area = ax === 'x' ? sz.y * sz.z : ax === 'y' ? sz.x * sz.z : sz.x * sz.y; const nw = new T.Vector3(ax === 'x' ? 1 : 0, 0, ax === 'z' ? 1 : 0).transformDirection(o.matrixWorld); if (ax !== 'y' && area > .3 && Math.abs(nw.y) < .2) glass.push({ o, b, ax, area }); } });
          const lm = new T.LineBasicMaterial({ color: 0xFFB200, transparent: true, opacity: 0, depthWrite: false }), panes = [];
          glass.forEach(({ o, ax }) => { const nrm = new T.Vector3(ax === 'x' ? 1 : 0, 0, ax === 'z' ? 1 : 0).transformDirection(o.matrixWorld), wc = new T.Box3().setFromObject(o).getCenter(new T.Vector3()); if (wc.clone().sub(c).setY(0).dot(nrm) < 0) nrm.multiplyScalar(-1); if (nrm.z < .5 && nrm.x < .5) return;
            const eg = new T.EdgesGeometry(o.geometry), M0 = new T.Matrix4().copy(inv).multiply(o.matrixWorld); for (let i = 0; i < 3; i++) { const l = new T.LineSegments(eg, lm); l.matrixAutoUpdate = false; l.visible = false; l.userData = { M0, nrm, i }; root.add(l); panes.push(l); } });
          S.bk = { outer, shM, panes, lm }; }
        const B = S.bk, w1 = sm((PR - 10.04) / .1), w0 = 1 - sm((PR - 10.2) / .06);
        B.outer.visible = w1 > .01 && w0 > .01; B.outer.scale.setScalar(1.22 - .2 * w1); B.shM.opacity = .22 * w1 * w0 + .04 * w1;
        if (PR > 10.44) B.shM.opacity *= 1 - sm((PR - 10.44) / .04);
        const lv = sm((PR - 10.22) / .02) * (1 - sm((PR - 10.45) / .03)); B.lm.opacity = .95 * lv;
        B.panes.forEach(g => { const { M0, nrm, i } = g.userData, k = sm((PR - 10.24 - i * .04) / .06); g.visible = lv > .01 && k > .01; if (!g.visible) return; const d = .06 + i * .12 + (1 - k) * 2.5; g.matrix.makeTranslation(nrm.x * d, 0, nrm.z * d).multiply(M0); }); }
      else if (S.bk) { S.bk.outer.visible = false; S.bk.panes.forEach(g => g.visible = false); }
      /* Hero: Produkt, Leben, Haustür, Services */
      { setOp(H.vitr, prodK); H.vitr.position.y = 28 * s(.44, .74);
        const tm = s(.5, .74); setOp(H.tt, 1 - tm); H.tt.position.y = -.6 * tm;
        const open = VK ? 0 : s(1.12, 1.22) * (1 - s(1.42, 1.54));
        H.hdoor.rotation.y = 1.45 * open;
        H.glow.material.opacity = cl(open * 1.8); H.glow.visible = open > .005;
        H.spill.material.opacity = .9 * open; H.spill.visible = open > .005; H.lamp.intensity = 16 * open;
        const fo = s(.55, .62) * (1 - s(2.25, 2.55)); H.fam.visible = VK ? PR < .84 : P > .55 && P < 2.56;
        if (H.fam.visible && VK) { const WP = [[[-9, 12.2], [6.5, 12.2]], [[11, 9.5], [7.5, 6.5], [7.5, 1]], [[9.5, 8.5], [13, 3.5]], [[-12, -11], [-12, 7]]], fo = 1 - sm((PR - .72) / .1);
          H.figs.forEach((f, i) => { const u = f.userData, sc = 1.8 / u.h; f.scale.setScalar(sc); const ph = (t * (.07 + i * .013) + i * .37) % 2, k = ph < 1 ? ph : 2 - ph, w = walk(WP[i], k), hd = w.h + (ph > 1 ? Math.PI : 0);
            pose(f, w.x, w.z, hd, w.d / sc, 1, i, t); f.visible = fo > .01; const m = u.mat; m.opacity = fo; m.transparent = fo < .999; m.depthWrite = fo > .5; }); }
        else if (H.fam.visible) H.figs.forEach((f, i) => { f.scale.setScalar(1);
          let w, k, hd, vis = true;
          if (P < 1) { const q = FA.f2[i]; k = s(.56 + i * .012, .9 + i * .012); w = walk([[q[0] + 20, q[1] + 1.3], [q[0] + 2.5, q[1] + .5], q], k); hd = ang(w.h, Math.PI, ks(k, .82, 1)); }
          else if (P < 1.58) { const a = 1 + FA.b3d[i]; k = s(a, a + .3); w = walk([FA.f2[i], FA.in3[i], [-2, 8.5], [-2, 6.9]], k); hd = ang(Math.PI, w.h, ks(k, 0, .1)); vis = w.z > 7.35; }
          else { const a = 1.6 + i * .025; k = s(a, a + .26); w = walk(FA.b4[i], k); hd = ang(w.h, FA.fh4[i], ks(k, .82, 1)); vis = w.z < -5.6; }
          pose(f, w.x, w.z, hd, w.d, Math.pow(Math.sin(Math.PI * cl(k)), .4), i, t);
          f.visible = vis && fo > .01; const m = f.userData.mat; m.opacity = fo; m.transparent = fo < .999; m.depthWrite = fo > .5;
        }); }

      R.render(scene, cam);

      if (FLY && FLY.img && FLY.ms.length) { const f = sm((PR - .03) / .11) * (1 - sm((PR - .88) / .1)), home = cfg.dock ? cfg.dock() : document.querySelector('[data-dock="home"]'), a = home && (home.closest('a') || home), conn = document.querySelector('[data-connector]');
        const fly = f > .002 && f < .998; FLY.ms.forEach(m => m.visible = f >= .998);
        const hide = f > .002; if (FLY.hid !== hide) { FLY.hid = hide; if (a) a.style.visibility = hide ? 'hidden' : ''; if (conn) conn.style.visibility = hide ? 'hidden' : ''; }
        if (fly && a) { const ra0 = a.getBoundingClientRect(), qs = ra0.width > ra0.height * 2 ? Math.max(18, ra0.height * 3) : 0, ra = qs ? { left: ra0.left, top: ra0.top + ra0.height / 2 - qs / 2, width: qs } : ra0, hb = host.getBoundingClientRect(), m = FLY.ms[0]; if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); const bb = m.geometry.boundingBox; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
          [[bb.min.x, bb.min.y], [bb.max.x, bb.min.y], [bb.min.x, bb.max.y], [bb.max.x, bb.max.y]].forEach(([px, py]) => { tmp.set(px, py, 0); m.localToWorld(tmp); tmp.project(cam); const sx = (tmp.x * .5 + .5) * SET.w + hb.left, sy = (-tmp.y * .5 + .5) * SET.h + hb.top; x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy); });
          const w = ra.width + (x1 - x0 - ra.width) * f, x = ra.left + (x0 - ra.left) * f, y = ra.top + (y0 - ra.top) * f - Math.sin(Math.PI * f) * 70;
          FLY.img.style.opacity = '1'; FLY.img.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + (w / 100).toFixed(4) + ')'; }
        else if (FLY.img.style.opacity !== '0') FLY.img.style.opacity = '0'; }
      if (TAGS) { const now = performance.now(), dt = Math.min(.05, (now - TAGS.lt) / 1000); TAGS.lt = now;
        TAGS.tw += dt * (reduce ? 0 : 1 + 4.5 * sm((PR - .16) / .46));
        const cr = TAGS.clear && PR > .66 && document.querySelector(TAGS.clear), hb = host.getBoundingClientRect(), rc = cr ? cr.getBoundingClientRect() : null;
        const dH = cam.position.distanceTo(TAGS.hc), dimK = 1 - .45 * sm((PR - .64) / .04), v = TAGS.v;
        TAGS.list.forEach(g => {
          const vin = sm((PR - g.ta) / .02), out = sm((PR - g.tv) / .03);
          if (vin < .001 || out > .999) { if (g.on) { g.el.style.opacity = '0'; g.on = 0; } return; }
          const an = g.ph + g.om * TAGS.tw, R = g.R * (1 + 1.6 * out);
          v.set(HC.x + Math.cos(an) * R, g.y + Math.sin(TAGS.tw * .6 + g.bp) * g.bob + 22 * out * out, HC.z + Math.sin(an) * R);
          const d = cam.position.distanceTo(v); v.project(cam); if (v.z > 1) { if (g.on) { g.el.style.opacity = '0'; g.on = 0; } return; }
          const x = (v.x * .5 + .5) * SET.w, y = (-v.y * .5 + .5) * SET.h, k = Math.max(.35, Math.min(1.9, 62 / d)) * (.7 + .3 * vin);
          let o = vin * (1 - out) * dimK * (1 - .6 * sm((d - dH) / 8)) * sm((y - (SET.narrow ? 80 : 108)) / 30);
          const inR = rc && x + hb.left > rc.left - 40 && x + hb.left < rc.right + 60 && y + hb.top > rc.top - 50 && y + hb.top < rc.bottom + 30;
          g.m += ((inR ? 0 : 1) - g.m) * .2; o *= g.m;
          g.on = 1; g.el.style.opacity = o.toFixed(3);
          g.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) translate(-50%,-50%) scale(' + k.toFixed(3) + ')';
        }); }
      /* Labels */
      const stk = [], col = [], warmL = [], lay = []; let avR = null;
      LABELS.forEach(L => {
        let v = L.fo ? (SET.focus && SET.focus.id === L.fo ? sm((SET.fk - .5) / .5) : 0) : (L.pr ? sP : sN)(L.from, L.from + (L.fd || .12)) * (1 - (L.pr ? sP : sN)(L.to - (L.fd || .12), L.to));
        if (L.t0 != null) v *= sm((t - L.t0) / .9);
        if (L.ls) L.ls.style.transform = 'scaleX(' + sN(L.strike[0], L.strike[1]).toFixed(3) + ')';
        if (L.big && SET.hover !== -1 && SET.hover !== L.e) v *= .4;
        if (L.kind === 'hot' && SET.focus && SET.focus.id !== L.hot) v = 0;
        else if (L.kind === 'hot' && SET.cur && SET.cur !== L.hot) v *= .45;
        if (v < .01) { if (L.on) { L.el.style.opacity = '0'; L.el.style.pointerEvents = 'none'; L.on = 0; if (L.cn) { L.cn.style.opacity = '0'; L.dt.style.opacity = '0'; } } return; }
        const a = S.A[L.a || L.id]; if (!a) return;
        a.getWorldPosition(tmp).project(cam);
        if (tmp.z > 1) return;
        let x = (tmp.x * .5 + .5) * SET.w; let y = (-tmp.y * .5 + .5) * SET.h;
        if (!L.wd || L.on !== 1) L.wd = L.el.offsetWidth; if (!SET.narrow && !L.free) x = Math.max(x, SET.w * .56); x = Math.min(x, SET.w - L.wd - 20);
        if (L.stack) { if (avR === null) { const ae = document.querySelector(L.stack); avR = ae && !SET.narrow ? ae.getBoundingClientRect().right + 28 : 0; } x = Math.min(Math.max(x, avR), SET.w - L.wd - 20); L.hh = L.el.offsetHeight || 40; stk.push({ L, x, y: y - 7, v }); return; }
        if (L.kind === 'hot') { L.hh = L.el.offsetHeight || 30; x = Math.max(20, x); const act = SET.focus ? SET.focus.id === L.hot : SET.cur === L.hot; if (!act && !SET.narrow && x < SET.w * .55) { if (L.on) { L.el.style.opacity = '0'; L.el.style.pointerEvents = 'none'; L.on = 0; } return; } col.push({ L, x, y: y - 7, v, pri: (SET.focus ? SET.focus.id === L.hot : SET.cur === L.hot) ? 0 : 1 }); return; }
        if (L.left) x -= (L.el.offsetWidth || 140);
        if (!L.kst && L.kind !== 'hot') { const ow = L.el.offsetWidth || 160; x = Math.min(x, SET.w - ow - 16); }
        if (L.above) { const ae = document.querySelector(L.above); if (ae) { if (!L.hh) L.hh = L.el.offsetHeight || 40; y = Math.min(y, ae.getBoundingClientRect().top - host.getBoundingClientRect().top - L.hh - 20 + 7); } }
        if (L.kst) { const h2 = L.el.offsetHeight || 30; if (L.center) x -= (L.el.offsetWidth || 80) / 2; L.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + (y - h2 / 2).toFixed(1) + 'px,0)'; L.el.style.opacity = v.toFixed(3); L.el.style.pointerEvents = 'none'; L.on = 1; return; }
        if (L.big) { const sh = SET.h >= 560; if (L.sub && L.shw !== sh) { L.shw = sh; L.sub.style.display = sh ? '' : 'none'; } L.hh = L.el.offsetHeight || 60; lay.push({ L, x, y: y - L.hh / 2, ax: x, ay: y, v }); return; }
        if (L.kind === 'warm' || L.avoid) { if (L.kind === 'warm') y += (1 - v) * 16; if (!L.hh) L.hh = L.el.offsetHeight || 40; L.wd = L.el.offsetWidth || L.wd || 160; warmL.push({ L, x, y: y - 7, v }); return; }
        if (L.free) { if (!L.hh) L.hh = L.el.offsetHeight || 40; y = Math.min(y, SET.h - (SET.narrow ? 150 : 112) - L.hh + 7); }
        L.el.style.transform = `translate3d(${x.toFixed(1)}px,${(y - (L.big ? 12 : 7) + (L.dy || 0)).toFixed(1)}px,0)`;
        L.el.style.opacity = v.toFixed(3); L.el.style.pointerEvents = (L.big || L.kind === 'hot') && v > .5 ? 'auto' : 'none'; L.on = 1;
        if (L.kind === 'hot') { const act = SET.focus ? SET.focus.id === L.hot : SET.cur === L.hot; if (act !== L.act) { L.act = act; L.el.style.color = act ? '#FFB200' : '#fff'; } }
      });
      if (lay.length) { const top = SET.narrow ? 100 : 68, bot = SET.h - (SET.narrow ? 120 : 96); lay.sort((a, b) => a.y - b.y);
        const y0 = lay.reduce((m, o) => m + o.y, 0) / lay.length; let prev = null; lay.forEach(o => { if (prev) o.y = Math.max(o.y, prev.y + prev.L.hh + 8); prev = o; });
        let dy = y0 - lay.reduce((m, o) => m + o.y, 0) / lay.length; const last = lay[lay.length - 1];
        dy = Math.min(dy, bot - (last.y + last.L.hh)); dy = Math.max(dy, top - lay[0].y);
        lay.forEach(o => { const L = o.L, bx = o.x + 18, by = o.y + dy + L.hh / 2, dx = bx - o.ax, dyy = by - o.ay, len = Math.hypot(dx, dyy);
          L.cn.style.width = len.toFixed(1) + 'px'; L.cn.style.transform = 'translate3d(' + o.ax.toFixed(1) + 'px,' + o.ay.toFixed(1) + 'px,0) rotate(' + Math.atan2(dyy, dx).toFixed(4) + 'rad)'; L.cn.style.opacity = (o.v * (len > 6 ? 1 : 0)).toFixed(3);
          L.dt.style.transform = 'translate3d(' + (o.ax - 2.5).toFixed(1) + 'px,' + (o.ay - 2.5).toFixed(1) + 'px,0)'; L.dt.style.opacity = o.v.toFixed(3);
          L.el.style.transform = 'translate3d(' + (o.x + 18).toFixed(1) + 'px,' + (o.y + dy).toFixed(1) + 'px,0)'; L.el.style.opacity = o.v.toFixed(3); L.el.style.pointerEvents = o.v > .3 ? 'auto' : 'none'; L.on = 1; }); }
      if (warmL.length) { const top = SET.narrow ? 96 : 140, placed = []; warmL.sort((a, b) => a.y - b.y);
        warmL.forEach(o => { const L = o.L; let y = Math.max(top, o.y);
          for (let n = 0; n < 8; n++) { const hit = placed.find(p => o.x < p.x + p.w + 24 && o.x + L.wd + 24 > p.x && y < p.y + p.h + (L.ag ?? 22) && y + L.hh + (L.ag ?? 22) > p.y); if (!hit) break; y = hit.y + hit.h + (L.ag ?? 22); }
          placed.push({ x: o.x, y, w: L.wd, h: L.hh, o }); });
        const bot = SET.h - (SET.narrow ? 130 : 104), low = Math.max(...placed.map(p => p.y + p.h)), sh = Math.max(0, low - bot);
        placed.forEach(p => { const L = p.o.L, y = Math.max(top, p.y - sh); L.el.style.transform = `translate3d(${p.x.toFixed(1)}px,${y.toFixed(1)}px,0)`; L.el.style.opacity = p.o.v.toFixed(3); L.el.style.pointerEvents = 'none'; L.on = 1; }); }
      if (col.length) { const top = SET.narrow ? 96 : 126, bot = SET.h - (SET.narrow ? 120 : 110), placed = []; col.sort((a, b) => a.pri - b.pri || a.y - b.y);
        col.forEach(o => { const L = o.L, w = L.wd || 160, h = L.hh; let y = Math.min(Math.max(o.y, top), bot - h);
          for (let n = 0; n < 8; n++) { const hit = placed.find(p => o.x < p.x + p.w + 8 && o.x + w + 8 > p.x && y < p.y + p.h + 6 && y + h + 6 > p.y); if (!hit) break; y = hit.y + hit.h + 6; if (y + h > bot) { y = Math.max(top, hit.y - h - 6); break; } }
          placed.push({ x: o.x, y, w, h });
          L.el.style.transform = `translate3d(${o.x.toFixed(1)}px,${y.toFixed(1)}px,0)`; L.el.style.opacity = o.v.toFixed(3); L.el.style.pointerEvents = o.v > .3 ? 'auto' : 'none'; L.on = 1;
          const act = SET.focus ? SET.focus.id === L.hot : SET.cur === L.hot; if (act !== L.act) { L.act = act; L.el.style.color = act ? '#FFB200' : '#fff'; } }); }
      if (stk.length) { stk.forEach(o => o.L.wd = o.L.el.offsetWidth || o.L.wd || 120); stk.sort((a, b) => (a.L.ord != null && b.L.ord != null) ? a.L.ord - b.L.ord : a.y - b.y); let prev = null; const y0 = stk.reduce((m, o) => m + o.y, 0) / stk.length, cx = Math.min(Math.max(...stk.map(o => o.x)) + (stk[0].L.gap || 12), SET.w - Math.max(...stk.map(o => o.L.wd)) - 20);
        stk.forEach(o => { if (prev) o.y = Math.max(o.y, prev.y + prev.L.hh + 6); prev = o; });
        const dy = y0 - stk.reduce((m, o) => m + o.y, 0) / stk.length;
        stk.forEach(o => { const L = o.L;
          L.el.style.transform = `translate3d(${cx.toFixed(1)}px,${Math.max(120, o.y + dy).toFixed(1)}px,0)`; L.el.style.opacity = o.v.toFixed(3); L.el.style.pointerEvents = 'none'; L.on = 1; }); }
    };
    wake();
    return {
      /* snap: ohne Übergang (unter dem schwarzen Zwischentitel) */
      setP(P, snap) { SET.tP = P; if (snap) { SET.P = P; SET.cPrev = null; SET.cb = 0; } wake(); },
      setFocus(id) { SET.focus = id && FOC[id] ? { id, ...FOC[id] } : null; wake(); },
      setStage(top, bottom) { if (SET.tT === top && SET.tB === bottom) return; SET.tT = top; SET.tB = bottom; wake(); },
      renderAt(P) { SET.P = SET.tP = P; frameX(); },
      get P() { return SET.P; },
      destroy() { SET.alive = 0; cancelAnimationFrame(SET.raf); io.disconnect(); document.removeEventListener('visibilitychange', onVis); removeEventListener('pointermove', onMove); R.dispose(); lab.innerHTML = ''; }
    };
}
