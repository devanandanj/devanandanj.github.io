+++
date = '2026-10-21T21:46:43+05:30'
title = 'Building a Low-Latency 1G Ethernet MAC'
+++

SOURCE: [low-latency-ethernet](https://github.com/devanandanj/low-latency-1g-ethernet)

## Purpose

- To be used in an ITCH 5.0 orderbook replication project.
- Target board : Xilinx Virtex-5 LX110T.
---

### Tools and technologies:
- Xilinx Virtex-5 - GMII, 8 bit data @ 125 MHz
- Xilinx ISE
- System Verilog RTL
- cocotb 1.9.2 + Verilator 5.02 for verification
- Data feed from ITCH 5.0 Sample data

### FPGA board selection

- Being a student it is hard to acquire modern FPGA boards to learn. Borowing boards available in my college department lab was the only option.
- The only viable options available was Zedboard Rev C (Zynq XC7Z020) and Virtex-5 LX110T.
- Zed board's gigabit PHY is wired to the Zynq processing system and not the actual FPGA fabric. So every packet will pass through the ARM side controller before reaching the fabric. That adds latency which is unavoidable.
- Another option was to use a PMOD 100 mb ethernet module. I thought that was a good approach as i would get to use a modern board, but in reality the use of 100 mb ethernet introduced 10x the latency, incoming packets would be the bottleneck.

```yml
1 Gb/s   : 8 ns per byte
100 Mb/s : 80 ns per byte
100-byte ITCH packet: ~0.8 us vs ~8 us just to arrive on the wire

```
- So the only option left was the Xilinx Virtex-5 board. Which in the sense was actual pain as I had to use old Xilinx ISE to generate bit stream.
- The practical experience of 1G ethernet outweighed the ISE pain. So the decision was set to use Xilinx Virtex-5.


### Design Decisions
-
